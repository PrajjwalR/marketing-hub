import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ensureBucketExists(bucketName: string) {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("Error listing buckets:", error);
    return;
  }

  const bucketExists = buckets?.some((b: any) => b.name === bucketName);
  if (!bucketExists) {
    console.log(`Bucket '${bucketName}' not found. Creating...`);
    const { error: createError } = await supabase.storage.createBucket(
      bucketName,
      {
        public: true,
      }
    );
    if (createError) {
      console.error(`Error creating bucket '${bucketName}':`, createError);
    } else {
      console.log(`Bucket '${bucketName}' created successfully.`);
    }
  } else {
    console.log(`Bucket '${bucketName}' already exists.`);
  }
}

ensureBucketExists("designs");
