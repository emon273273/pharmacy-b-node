import { Request, Response } from "express";
import getPagination from "../../utils/paginateQuery";
import XLSX from "xlsx";
import prisma from "../../utils/prisma";
import { createMedicineSchema } from "../../utils/schema/createMedicineSchema";
import { object } from "zod";

interface MedicineQuery {
  query?: string;
  key?: string;
  page?: string;
  count?: string;
}

interface MedicineRow {
  medicineName: string;
  genericName: string;
  brandName: string;
  description: string;
  dosageType: string;
  unitType: string;
  reorderLevel: number;
  categoryName: string;
  supplierName: string;
  batchNumber: string;
  quantity: number;
  manufacturingDate: string; 
  expiryDate: string;      
  purchasePrice: number;
  sellingPrice: number;
}

export const createMedicine =async (req:Request,res:Response):Promise<void>=>{
  try {

    const queryType=req.query.query as string;
    
    if(queryType==='single'){

      await createSingleMedicine(req,res);
      return;
    }

    if (queryType==='createMany'){

      await createBulkMedicine(req,res);
      return;
    }

    res.status(400).json({
      status:false,
      message:"Invalid query type",
    })
    
  } catch (error) {
    
    res.status(500).json({
      status:false,
      message:"Server error",
      error:(error as Error).message,
    })
  }
}

 const createSingleMedicine = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1️⃣ Validate input

    const parsed = createMedicineSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: false,
        message: "Validation Error",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const data = parsed.data;

    // create medicine with batches
    const medicine = await prisma.medicine.create({
      data: {
        medicineName: data.medicineName,
        genericName: data.genericName,
        brandName: data.brandName,
        description: data.description,

        dosageType: data.dosageType,
        unitType: data.unitType,

        reorderLevel: data.reorderLevel ?? 0,

        categoryId: data.categoryId,
        supplierId: data.supplierId,

        // Create batch records
        batches: {
          create: data.batches.map((b) => ({
            batchNumber: b.batchNumber,
            quantity: b.quantity,
            manufacturingDate: b.manufacturingDate
              ? new Date(b.manufacturingDate)
              : null,
            expiryDate: new Date(b.expiryDate),
            purchasePrice: b.purchasePrice,
            sellingPrice: b.sellingPrice,
          })),
        },
      },
      include: {
        batches: true,
        category: true,
        supplier: true,
      },
    });

    res.status(201).json({
      message: "Medicine created successfully",
      createdMedicine: medicine,
    });
  } catch (err) {
    const error = err as Error;
    console.error("Create Medicine Error:", error);

    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};


export const createBulkMedicine = async (req: Request, res: Response): Promise<void> => {
  try {
    

    if(!req.file){

      res.status(400).json({
        status:false,
        message:"No file uploaded",
      })
      return;
    }

    // step 1 : Read The Excel 
    const workbook =XLSX.read(req.file.buffer,{type:"buffer"});
    const sheet=workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<MedicineRow>(sheet);

    if(!rows.length){

      res.status(400).json({
        status:false,
        message:"No data found in the file",
      })
      return;
    }

    // step 2 : Extract Unique Category and Supplier Names
    const uniqueCategoryNames=[...new Set(rows.map(r=>r.categoryName).filter(Boolean))];
    const uniqueSupplierNames=[...new Set(rows.map(r=>r.supplierName).filter(Boolean))];

    // step 3 fetch categories and suppliers
    const categories=await prisma.category.findMany({

      where:{
        name:{in:uniqueCategoryNames}
      },
      select:{id:true,name:true}
    });


    const suppliers=await prisma.supplier.findMany({

      where:{
        name:{in:uniqueSupplierNames}
      },
      select:{id:true,name:true}
    });



    //step 4 create map for easy access name -> id

    const categoryMap=new Map(categories.map(c=>[c.name,c.id]));
    const supplierMap=new Map(suppliers.map(s=>[s.name,s.id]));

    // step 5 validate : check if any category or supplier is missing is missing from db

    const missingCategories=uniqueCategoryNames.filter(name=>!categoryMap.has(name));
    const missingSuppliers=uniqueSupplierNames.filter(name=>!supplierMap.has(name));

    if(missingCategories.length>0 || missingSuppliers.length>0){

      res.status(400).json({
        status:false,
        message:"Missing categories or suppliers",
        missingCategories,
        missingSuppliers,
      })
      return;
    }


    // step 6 create medicine 
    const medicineMap:Record<string,any>={}

    for (const row of rows){

       const key = `${row.medicineName}_${row.brandName}`;

       const categoryId=categoryMap.get(row.categoryName);
       const supplierId=supplierMap.get(row.supplierName);

       if(!medicineMap[key]){

        medicineMap[key]={

          medicineName:row.medicineName,
          genericName:row.genericName,
          brandName:row.brandName,
          description:row.description,
          dosageType:row.dosageType,
          unitType:row.unitType,
          reorderLevel:row.reorderLevel,
          categoryId,
          supplierId,
          batches:[]
        };
       }

       medicineMap[key].batches.push({
        batchNumber:row.batchNumber,
        quantity:row.quantity,
        manufacturingDate:row.manufacturingDate,
        expiryDate:row.expiryDate,
        purchasePrice:row.purchasePrice,
        sellingPrice:row.sellingPrice,
       })
    
       }
    

       //step 7 insert into database

      const medicineToCreate=Object.values(medicineMap);


      // step 8 use transaction to ensure all or nothing success 

      const result=await prisma.$transaction(async (tx)=>{

        const createMedicine=[];

        for (const meddata of medicineToCreate){

          const {batches,...medicineFields}=meddata;

          const newMed =await tx.medicine.create({

            data:{
              ...medicineFields,
              batches:{
                create:batches
              } 
            }
            
          });
          createMedicine.push(newMed);
          
        }
        return createMedicine;
      })

      res.status(201).json({
        message:"Medicine created successfully",
        createdMedicine:result,
      })
    
  } catch (error) {
    const err=error as Error;
    console.error("Create Bulk Medicine Error:",err);
    res.status(500).json({
      status:false,
      message:"Server error",
      error:err.message,
    })
  }
}




export const getAllMedicine = async (req: Request, res: Response): Promise<void> => {
  try {

    
    const query = req.query as MedicineQuery;

    if (query.query === "all") {
      const medicines = await prisma.medicine.findMany({
        orderBy: { id: "desc" },
        include: {
          category: true,
          supplier: true,
          batches: true,
        },
      });

      res.status(200).json(medicines);
      return;
    } else if (query.query === "search") {
      const { skip, limit } = getPagination(query);

      const medicines = await prisma.medicine.findMany({
        orderBy: { id: "desc" },
        where: {
          OR: [
            { medicineName: { contains: query.key || "", mode: "insensitive" } },
            { genericName: { contains: query.key || "", mode: "insensitive" } },
            { brandName: { contains: query.key || "", mode: "insensitive" } },
          ],
        },
        include: {
          category: true,
          supplier: true,
          batches: true,
        },
        skip: Number(skip),
        take: Number(limit),
      });

      const aggregations = await prisma.medicine.aggregate({
        where: {
          OR: [
            { medicineName: { contains: query.key || "", mode: "insensitive" } },
            { genericName: { contains: query.key || "", mode: "insensitive" } },
            { brandName: { contains: query.key || "", mode: "insensitive" } },
          ],
        },
        _count: { id: true },
      });

      res.status(200).json({
        getAllMedicine: medicines,
        totalMedicine: aggregations._count.id,
      });
      return;
    } else {
      const { skip, limit } = getPagination(query);

      const medicines = await prisma.medicine.findMany({
        orderBy: { id: "desc" },
        include: {
          category: true,
          supplier: true,
          batches: true,
        },
        skip: Number(skip),
        take: Number(limit),
      });

      const aggregations = await prisma.medicine.aggregate({
        _count: { id: true },
      });

      res.status(200).json({
        getAllMedicine: medicines,
        totalMedicine: aggregations._count.id,
      });
      return;
    }
  } catch (err) {
    const error = err as Error;
    console.error("Get All Medicines Error:", error);

    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
