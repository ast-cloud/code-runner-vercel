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
        await fs.writeFile('./codeFile/code.py', req.body.code);
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
    

    const runPyCodeResult = spawnSync('python3', ['./codeFile/code.py'], {input: fssync.readFileSync('./inputFile/input.txt'), encoding:'utf-8', shell: true});
    
    if(runPyCodeResult.error){
        res.json({'error':'Runtime error', 'output':String(runPyCodeResult.error.message)});
        return;
    }
    else if(runPyCodeResult.status===null){
        res.json({'error':'Runtime error', 'output':String(runPyCodeResult.stderr)});
        return;
    }
    else if(runPyCodeResult.status!=0){
        res.json({'error':'Compilation error', 'output':String(runPyCodeResult.stderr)});
        return;
    }
    res.status(200).json({'error':'none', 'output': String(runPyCodeResult.stdout)});

    try {
        fssync.unlinkSync('./codeFile/code.py');
        console.log(`File ./codeFile/code.py deleted successfully.`);
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