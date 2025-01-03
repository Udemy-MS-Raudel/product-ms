import { Controller, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern('create.product')
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @MessagePattern('find.all.products')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productService.findAll(paginationDto);
  }

  @MessagePattern('find.one.product')
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @MessagePattern('update.product')
  update(@Payload() updateProductDto: UpdateProductDto) {
    return this.productService.update(updateProductDto);
  }

  @MessagePattern('delete.product')
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
