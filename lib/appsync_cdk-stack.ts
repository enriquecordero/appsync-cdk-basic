import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import { NodejsFunction ,NodejsFunctionProps  } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Architecture, FunctionProps, LambdaInsightsVersion, Tracing } from 'aws-cdk-lib/aws-lambda';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { FieldLogLevel } from '@aws-cdk/aws-appsync-alpha';
import { CfnOutput } from 'aws-cdk-lib';
export class AppsyncCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'my-book-api',
      schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
      authorizationConfig:{
        defaultAuthorization:{
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig:{
            name: "My own APIKEY",
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          }
        }
      },logConfig:{
        fieldLogLevel: FieldLogLevel.ALL
      },
      xrayEnabled: true
    });

    const booksTable = new Table(this,'BooksTable',{
      tableName: 'BooksTable',
      partitionKey:{name: "id",type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST
    })

  const commonLambdaProps: Omit<NodejsFunctionProps,"handler"> = {
    memorySize: 128,
    timeout: cdk.Duration.seconds(5),
    architecture: Architecture.ARM_64,
    environment:{
      BOOK_TABLE: booksTable.tableName
    }, 
    bundling:{
      minify:true,
      sourceMap:false
    }, 
    tracing: Tracing.ACTIVE,
    insightsVersion: LambdaInsightsVersion.VERSION_1_0_119_0
  } 

//Read all books 
    const listBookLambda = new NodejsFunction(this,'listBookHandler',{
      functionName: "listBookHandler",
      entry: "lambda/books/listBooks.ts",
      handler: "handler",
      ...commonLambdaProps
    })

    booksTable.grantReadData(listBookLambda);
    const listBookSDataSource = api.addLambdaDataSource("listBookSDataSource",listBookLambda)

    listBookSDataSource.createResolver({
      typeName:"Query",
      fieldName: "listBooks",
    })
    // Get a book by id 

    const getBookByIDLambda = new NodejsFunction(this,'getBookByIdHandler',{
      functionName: "getBookByIdHandler",
      entry: "lambda/books/getBookById.ts",
      handler: "handler",
      ...commonLambdaProps

    })

    booksTable.grantReadData(getBookByIDLambda);
    const getBookDataSource = api.addLambdaDataSource("getBookDataSource",getBookByIDLambda)

    getBookDataSource.createResolver({
      typeName:"Query",
      fieldName: "getBookById",
    })

    //Mutacion createBook 

    const createBookLambda = new NodejsFunction(this,'createBookHandler',{
      functionName: "createBookHandler",
      entry: "lambda/books/createBook.ts",
      handler: "handler",
      ...commonLambdaProps

    })
    booksTable.grantReadWriteData(createBookLambda);
    const createBookSDataSource = api.addLambdaDataSource("createBookSDataSource",createBookLambda)

    createBookSDataSource.createResolver({
      typeName:"Mutation",
      fieldName: "createBook",
    })

        //Mutacion createBook 

        const updateBookLambda = new NodejsFunction(this,'updateBookHandler',{
          functionName: "updateBookHandler",
          entry: "lambda/books/updateBook.ts",
          handler: "handler",
          ...commonLambdaProps
    
        })
        booksTable.grantReadWriteData(updateBookLambda);
        const updateBookSDataSource = api.addLambdaDataSource("updateBookSDataSource",updateBookLambda)
    
        updateBookSDataSource.createResolver({
          typeName:"Mutation",
          fieldName: "updateBook",
        })

        new CfnOutput(this, "GraphqlAPIURL",{
          value: api.graphqlUrl
        })

        new CfnOutput(this, "GraphqlAPIKey",{
          value: api.apiKey || ""
        })

    


  }
}
