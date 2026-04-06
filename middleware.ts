import { NextRequest, NextResponse } from "next/server";
import Personalize from "@contentstack/personalize-edge-sdk";

export const config = {
  matcher: ["/((?!_next|favicon\\.ico|api).*)"],
};

export default async function middleware(request: NextRequest) {
  const edgeApiUrl =
    process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL;
  if (edgeApiUrl) {
    Personalize.setEdgeApiUrl(edgeApiUrl);
  }

  const projectUid =
    process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;
  if (!projectUid) {
    return NextResponse.next();
  }

  const personalizeSdk = await Personalize.init(projectUid, { request });

  const variantParam = personalizeSdk.getVariantParam();
  const url = request.nextUrl.clone();
  url.searchParams.set(Personalize.VARIANT_QUERY_PARAM, variantParam);

  const response = NextResponse.rewrite(url);

  await personalizeSdk.addStateToResponse(response);
  response.headers.set("cache-control", "no-store");

  return response;
}
