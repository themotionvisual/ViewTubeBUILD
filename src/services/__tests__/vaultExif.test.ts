import { describe, expect, it } from "vitest"
import { parseJpegExifBuffer } from "../vaultExif"

const buildMinimalExifJpeg = () => {
 const bytes = new Uint8Array(96)
 let o = 0
 bytes[o++] = 0xff; bytes[o++] = 0xd8
 bytes[o++] = 0xff; bytes[o++] = 0xe1
 bytes[o++] = 0x00; bytes[o++] = 0x58
 for (const ch of "Exif") bytes[o++] = ch.charCodeAt(0)
 bytes[o++] = 0; bytes[o++] = 0
 // TIFF little endian
 bytes[o++] = 0x49; bytes[o++] = 0x49
 bytes[o++] = 0x2a; bytes[o++] = 0x00
 bytes[o++] = 0x08; bytes[o++] = 0x00; bytes[o++] = 0x00; bytes[o++] = 0x00
 // IFD0: 3 entries
 bytes[o++] = 0x03; bytes[o++] = 0x00
 const writeEntry=(tag:number,type:number,count:number,value:number)=>{
  bytes[o++]=tag&255; bytes[o++]=(tag>>8)&255
  bytes[o++]=type&255; bytes[o++]=(type>>8)&255
  bytes[o++]=count&255; bytes[o++]=(count>>8)&255; bytes[o++]=(count>>16)&255; bytes[o++]=(count>>24)&255
  bytes[o++]=value&255; bytes[o++]=(value>>8)&255; bytes[o++]=(value>>16)&255; bytes[o++]=(value>>24)&255
 }
 // Orientation SHORT=6 stored inline
 writeEntry(0x0112,3,1,6)
 // Width LONG=1920
 writeEntry(0x0100,4,1,1920)
 // Height LONG=1080
 writeEntry(0x0101,4,1,1080)
 bytes[o++]=0; bytes[o++]=0; bytes[o++]=0; bytes[o++]=0
 return bytes.buffer
}

describe("parseJpegExifBuffer", () => {
 it("reads factual orientation and encoded dimensions from JPEG EXIF", () => {
  expect(parseJpegExifBuffer(buildMinimalExifJpeg())).toMatchObject({
   orientation: 6,
   imageWidth: 1920,
   imageHeight: 1080,
  })
 })

 it("returns an empty object when JPEG EXIF is absent", () => {
  expect(parseJpegExifBuffer(new Uint8Array([0xff,0xd8,0xff,0xd9]).buffer)).toEqual({})
 })
})
