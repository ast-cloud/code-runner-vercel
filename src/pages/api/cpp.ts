import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import fssync from 'fs';
import {spawn, spawnSync} from 'child_process';


type Data = {
    error: string;
    output: string;
  }

export default async function handler( req: NextApiRequest, res: NextApiResponse<Data>){

    try{
        await fs.writeFile('./codeFile/code.cpp', req.body.code);
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
    

    const compileResult = spawnSync('g++', ['-o', './codeFile/cppExecutable', './codeFile/code.cpp']);

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
    console.log('Code compiled successfully : g++ process exited with code '+compileResult.status);

    const runCPPCodeResult = spawnSync('./codeFile/cppExecutable', {input: fssync.readFileSync('./inputFile/input.txt'), encoding: 'utf-8', shell: true});
    console.log(' runCPPCodeResult.output - ', runCPPCodeResult.output);
    if(runCPPCodeResult.error){
        res.json({'error':'Runtime error', 'output':String(runCPPCodeResult.error.message)});
        return;
    }
    else if(runCPPCodeResult.status===null){
        res.json({'error':'Runtime error', 'output':String(runCPPCodeResult.stderr)});
        return;
    }
    else if(runCPPCodeResult.status!=0){
        res.json({'error':'Runtime error', 'output':String(runCPPCodeResult.stderr)});
        return;
    }
    res.status(200).json({'error':'none', 'output': String(runCPPCodeResult.stdout)});

    try {
        fssync.unlinkSync('./codeFile/code.cpp');
        console.log(`File ./codeFile/code.cpp deleted successfully.`);
    } catch (err) {
        console.error(`Error deleting the file: ${err}`);
    }
    try {
        fssync.unlinkSync('./codeFile/cppExecutable');
        console.log(`File ./codeFile/cppExecutable deleted successfully.`);
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