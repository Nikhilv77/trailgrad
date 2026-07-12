import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { ResumeUploadError } from "@/lib/resume/upload-errors";

export interface PrivateObjectStorage {
  putObject(input: {
    key: string;
    bytes: Buffer;
    contentType: string;
    contentLength: number;
    contentHash: string;
  }): Promise<void>;
  deleteObject(key: string): Promise<void>;
  getSignedReadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new ResumeUploadError("STORAGE_FAILURE");
  }

  return value;
}

class S3CompatiblePrivateObjectStorage implements PrivateObjectStorage {
  private readonly bucket = getRequiredEnv("S3_BUCKET");
  private readonly client = new S3Client({
    endpoint: getRequiredEnv("S3_ENDPOINT"),
    region: process.env.S3_REGION || "auto",
    credentials: {
      accessKeyId: getRequiredEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("S3_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: true,
  });

  async putObject(input: {
    key: string;
    bytes: Buffer;
    contentType: string;
    contentLength: number;
    contentHash: string;
  }) {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: input.key,
          Body: input.bytes,
          ContentLength: input.contentLength,
          ContentType: input.contentType,
          Metadata: {
            sha256: input.contentHash,
          },
        }),
      );
    } catch {
      throw new ResumeUploadError("STORAGE_FAILURE");
    }
  }

  async deleteObject(key: string) {
    await this.client
      .send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      )
      .catch(() => undefined);
  }

  async getSignedReadUrl(key: string, expiresInSeconds = 300) {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
      { expiresIn: expiresInSeconds },
    );
  }
}

let storage: PrivateObjectStorage | null = null;

export function getPrivateObjectStorage() {
  storage ??= new S3CompatiblePrivateObjectStorage();

  return storage;
}
