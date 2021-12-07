import { AutoIncrement, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { prop, Schema } from './../../esm2015';

@Table({
    timestamps: true,
})
@Schema()
export default class User extends Model {

    @AutoIncrement
    @PrimaryKey
    @Column
    @prop()
    id: number;


    @Column
    @prop()
    nickname: string;
}