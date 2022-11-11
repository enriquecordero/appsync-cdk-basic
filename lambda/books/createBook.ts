import {AppSyncResolverHandler} from "aws-lambda";
import {DynamoDB} from "aws-sdk";
import { MutationCreateBookArgs, Book } from "../../types/books";

const documentClient = new DynamoDB.DocumentClient();
export const handler:AppSyncResolverHandler<MutationCreateBookArgs,Book | null>  = async (event) => {
  const book = event.arguments.book;
    try {
      await documentClient.put({
        TableName: process.env.BOOK_TABLE!,
        Item: book,
      }).promise();
      return book;

    } catch (error) {
      console.error("Whoops,error")
      return null;
    }
}