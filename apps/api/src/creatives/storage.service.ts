import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { getEnv } from "../common/env";

@Injectable()
export class StorageService {
  private readonly env = getEnv();
  private readonly client = new S3Client({
    region: this.env.S3_REGION,
    endpoint: this.env.S3_ENDPOINT,
    forcePathStyle: this.env.S3_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: this.env.S3_ACCESS_KEY,
      secretAccessKey: this.env.S3_SECRET_KEY
    }
  });

  async uploadObject(params: {
    objectKey: string;
    body: Buffer;
    contentType: string;
  }): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.env.S3_BUCKET,
        Key: params.objectKey,
        Body: params.body,
        ContentType: params.contentType,
        ContentLength: params.body.length
      })
    );

    return this.objectUrl(params.objectKey);
  }

  objectUrl(objectKey: string): string {
    const endpoint = this.env.S3_ENDPOINT.replace(/\/$/, "");
    return `${endpoint}/${this.env.S3_BUCKET}/${objectKey}`;
  }
}
