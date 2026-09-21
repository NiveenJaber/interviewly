declare module "pdf-parse" {
  export default function parse(data: Buffer): Promise<{ text: string }>;
}
