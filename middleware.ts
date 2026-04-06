import { NextRequest, NextResponse } from "next/server";
import Personalize from "@contentstack/personalize-edge-sdk";

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|css|js|woff2?|ttf|eot)$).*)"],
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and non-page requests
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes("favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const projectUid =
    process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;
  if (!projectUid) {
    return NextResponse.next();
  }

  const edgeApiUrl =
    process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL;
  if (edgeApiUrl) {
    Personalize.setEdgeApiUrl(edgeApiUrl);
  }

  try {
    const personalizeSdk = await Personalize.init(projectUid, { request });

    const variantParam = personalizeSdk.getVariantParam();
    const url = request.nextUrl.clone();
    url.searchParams.set(Personalize.VARIANT_QUERY_PARAM, variantParam);

    const response = NextResponse.rewrite(url);

    await personalizeSdk.addStateToResponse(response);
    response.headers.set("cache-control", "no-store");

    return response;
  } catch (e) {
    console.error("[Personalize] middleware error:", e);
    return NextResponse.next();
  }
}
