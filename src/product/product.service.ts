import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

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
    const productFound = await this.product.findUnique({where: {id, available: true}});

    if(!productFound){
      throw new NotFoundException(`Product with Id:${id} does not exist`)
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
}
