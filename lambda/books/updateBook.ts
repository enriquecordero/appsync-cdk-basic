import {AppSyncResolverHandler} from "aws-lambda";
import {DynamoDB} from "aws-sdk";
import { Book, MutationUpdateBookArgs } from '../../types/books';
import dynoexpr from '@tuplo/dynoexpr'

const documentClient = new DynamoDB.DocumentClient();
export const handler:AppSyncResolverHandler<MutationUpdateBookArgs,Book | null>  = async (event) => {
  
    try {
      const book = event.arguments.book;
      const params = dynoexpr<DynamoDB.DocumentClient.UpdateItemInput>({
        TableName: process.env.BOOK_TABLE!,
        Key:{id: book.id},
        ReturnValues: "ALL_NEW",
        Update:{
          ...(book.title !== undefined ? {title: book.title} :{}),
          ...(book.rating !== undefined ? {rating: book.rating} :{}),
          ...(book.completed !== undefined ? {completed: book.completed} :{}),
        }
      })
      const result = await documentClient.update(params).promise();
      return result.Attributes as Book 
      }    

    catch (error) {
      console.error("Whoops,error")
      return null;
    }
}