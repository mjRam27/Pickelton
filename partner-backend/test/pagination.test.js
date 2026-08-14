import test from "node:test";
import assert from "node:assert/strict";
import { pagination, pageResult } from "../src/utils/pagination.js";

test("pagination clamps unsafe input",()=>{assert.deepEqual(pagination({page:"-5",size:"1000"}),{page:0,size:100,offset:0});});
test("page result exposes stable metadata",()=>{assert.deepEqual(pageResult([{id:1}],21,1,10),{content:[{id:1}],page:1,size:10,totalElements:21,totalPages:3,last:false});});
