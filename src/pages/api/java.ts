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
        await fs.writeFile('./code.java', req.body.code);
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
    

    const compileResult = spawnSync('javac', ['./code.java']);

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
    console.log('Code compiled successfully : javac process exited with code '+compileResult.status);

    const runJavaCodeResult = spawnSync('java', ['Codetown'], {input: fssync.readFileSync('./inputFile/input.txt'), encoding: 'utf-8', shell: true});

    if(runJavaCodeResult.error){
        res.json({'error':'Runtime error', 'output':String(runJavaCodeResult.error.message)});
        return;
    }
    else if(runJavaCodeResult.status===null){
        res.json({'error':'Runtime error', 'output':String(runJavaCodeResult.stderr)});
        return;
    }
    else if(runJavaCodeResult.status!=0){
        res.json({'error':'Runtime error', 'output':String(runJavaCodeResult.stderr)});
        return;
    }
    res.status(200).json({'error':'none', 'output': String(runJavaCodeResult.stdout)});

    try {
        fssync.unlinkSync('./code.java');
        console.log(`File ./code.java deleted successfully.`);
    } catch (err) {
        console.error(`Error deleting the file: ${err}`);
    }
    try {
        fssync.unlinkSync('./Codetown.class');
        console.log(`File ./Codetown.class deleted successfully.`);
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