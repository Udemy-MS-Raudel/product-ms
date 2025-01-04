import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('PRODUCT SERVICES');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('database connected');
  }

  async create(createProductDto: CreateProductDto) {
    return await this.product.create({data: createProductDto});
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalProducts = await this.product.count({ where: {available: true}});
    const lastPage = Math.ceil(totalProducts/limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {available: true}
      }),
      metadata: {
        totalProducts,
        page,
        lastPage
      }
    };
  }

  async findOne(id: number) {
    const productFound = await this.product.findFirst({where: {id, available: true}});

    if(!productFound){
      throw new RpcException({
        message: `Product with Id:${id} does not exist`, 
        status: HttpStatus.BAD_REQUEST
      })
    }

    return productFound;
  }

  async update(updateProductDto: UpdateProductDto) {

    const {id, ...data } = updateProductDto;

    await this.findOne(id);

    return await this.product.update({
      where: {id},
      data
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    const productDeleted = await this.product.update({
      where: {id},
      data: {
        available: false
      }
    })
    return productDeleted;
  }

  async validateProducts(ids: number[]){
    //Con esto Set* creo ids que no esten duplicados
    //Luego con Array.from los convierto en array
    ids = Array.from(new Set(ids));

    const productsFound = await this.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    if(productsFound.length !== ids.length){
      throw new RpcException({
        message: `Some products were not found`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    return productsFound;

  }

}
