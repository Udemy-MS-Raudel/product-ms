import { Type } from "class-transformer";
import { IsNumber, IsPositive, IsString, Min } from "class-validator";

export class CreateProductDto {

  @IsString()
  public name: string;

  //Limitar los decimales en un numero ejemplo 10.5555
  @IsNumber({
    maxDecimalPlaces: 4,
  })
  @IsPositive()
  @Min(0)
  @Type(()=> Number)
  public price: number
}
