import { http } from "./http";

export function fetchXmlBlob(accessKey: string) {
    return http.get(`/sefaz/xml/${accessKey}`, { responseType: "blob" }).then((res) => res.data as Blob);
}