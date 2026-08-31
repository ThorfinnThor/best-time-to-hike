import test from "node:test";
import assert from "node:assert/strict";
import { matchDestinations } from "../lib/finder/match";
const destination=(slug:string,temp:number,wet:number,snow:number,score:number)=>({id:slug,slug,name:slug,countryCode:"XX",continent:"europe",region:"test",tags:[],monthly:Array.from({length:12},(_,i)=>({m:i+1,score,temp,wet,snow,hot:0,wind:10,daylight:12,confidence:90}))});
test("finder keeps hiking score distinct from user match",()=>{const results=matchDestinations([destination("dry",18,.05,0,80),destination("wet",18,.6,0,90)],{month:1,region:"all",minTemp:10,maxTemp:24,avoidRain:true,avoidSnow:true});assert.equal(results[0].destination.slug,"dry");assert.equal(results[0].month.score,80);assert.notEqual(results[0].match,results[0].month.score)});
