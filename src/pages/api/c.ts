import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import fssync from 'fs';
import {spawn, spawnSync} from 'child_process';


type Data = {
    error: string;
    output: string;
  }

export default async function handler( req: NextApiRequest, res: NextApiResponse<Data>) {

    try{
        await fs.writeFile('./codeFile/code.c', req.body.code);
        console.log('Code file created successfully.')
    }catch(e){
        throw e;
    }

    try{
        await fs.writeFile('./inputFile/input.txt', req.body.input);
        console.log('Input file created successfully.')
    }catch(e){
        throw e;
    }


    const compileResult = spawnSync('gcc', ['-o', './codeFile/cExecutable', './codeFile/code.c']);

    if(compileResult.error){
        res.json({'error':'Compilation error', 'output':String(compileResult.error.message)});
        return;
    }
    else if(compileResult.status===null){
        res.json({'error':'Compilation error', 'output':String(compileResult.stderr)});
        return;
    }
    else if(compileResult.status!=0){
        res.json({'error':'Compilation error', 'output':String(compileResult.stderr)});
        return;
    }
    console.log('Code compiled successfully : gcc process exited with code '+compileResult.status);
    
    const runCCodeResult = spawnSync('./codeFile/cExecutable', {input: fssync.readFileSync('./inputFile/input.txt'), encoding: 'utf-8', shell: true});
    
    if(runCCodeResult.error){
        res.json({'error':'Runtime error', 'output':String(runCCodeResult.error.message)});
        return;
    }
    else if(runCCodeResult.status===null){
        res.json({'error':'Runtime error', 'output':String(runCCodeResult.stderr)});
        return;
    }
    res.status(200).json({'error':'none', 'output': String(runCCodeResult.stdout)});

    try {
        fssync.unlinkSync('./codeFile/code.c');
        console.log(`File ./codeFile/code.c deleted successfully.`);
    } catch (err) {
        console.error(`Error deleting the file: ${err}`);
    }
    try {
        fssync.unlinkSync('./codeFile/cExecutable');
        console.log(`File ./codeFile/cExecutable deleted successfully.`);
    } catch (err) {
        console.error(`Error deleting the file: ${err}`);
    }
    try {
        fssync.unlinkSync('./inputFile/input.txt');
        console.log(`File ./inputFile/input.txt deleted successfully.`);
    } catch (err) {
        console.error(`Error deleting the file: ${err}`);
    }
  }
  