import {AppSyncResolverHandler} from "aws-lambda";
import {DynamoDB} from "aws-sdk";
import { Book } from "../../types/books";




const documentClient = new DynamoDB.DocumentClient();

export const handler:AppSyncResolverHandler<null,Book[] | null>  = async () => {

    try {
      const data = await documentClient.scan({
        TableName: process.env.BOOK_TABLE!
      }).promise();
      return data.Items as Book[];

    } catch (error) {
      console.error("Whoops,error")
      return null;
    }
}