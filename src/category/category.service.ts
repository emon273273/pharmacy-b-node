import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryQueryDto } from './dto/category-query.dto';
import { getPagination } from '@/common/utils/pagination';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.category.create({
      data: { name },
    });
  }

  //find all
  async getAllCategories(query:CategoryQueryDto){

    
    if(query.query=='all'){

      const categories=await this.prisma.category.findMany({
        orderBy:{
          id:'desc'
        }
      });
      return {
        message:'Categories fetched successfully',
        categories
      }
    }

    if(query.query=='search'){

      const {skip,limit}=getPagination(query);

      const categories=await this.prisma.category.findMany({
        where:{
          name:{
            contains:query.key || '',mode:'insensitive'
          },
          
        },
        orderBy:{
            id:'desc'
          },
        skip,
        take:limit
      })

      const aggregations=await this.prisma.category.aggregate({

        where:{
          name:{contains:query.key || '',mode:'insensitive'}
        },
        _count:{
          id:true
        }
      })

      return {
        getAllCategories:categories,
        total:aggregations._count.id
      }
    }

    // default pagination list 

    const {skip,limit}=getPagination(query);

    const categories=await this.prisma.category.findMany({

      orderBy:{
        id:'desc'
      },
      skip,
      take:limit

    })

    const total=await this.prisma.category.count();

    return {
      getAllCategories:categories,
      total
    }
  }
}
