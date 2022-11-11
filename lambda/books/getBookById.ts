import {AppSyncResolverHandler} from "aws-lambda";
import {DynamoDB} from "aws-sdk";
import { Book, QueryGetBookByIdArgs } from "../../types/books";

const documentClient = new DynamoDB.DocumentClient();

export const handler:AppSyncResolverHandler<QueryGetBookByIdArgs, Book | null>  = async (event) => {

  const bookId = event.arguments.BookId
  
    try {

      const {Item} = await documentClient.get({
        TableName: process.env.BOOK_TABLE!,
        Key: {id: bookId}
      }).promise();
      return Item as Book;

    } catch (error) {
      console.error("Whoops,error")
      return null;
    }
}