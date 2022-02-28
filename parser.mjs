import { match } from 'assert';
import { ChildProcess } from 'child_process';
import fs from 'fs';
import Path from 'path';



/*
source
: (TEXT | ifdef)*
;
ifdef
: (IFDEF | IFNDEF) SYM
source
(ELIF SYM source)*
(ELSE source)?
ENDIF
;

*/
function parse(text) {
  const tokens = scan(text);
  let index = 0;
  let lookahead = nextToken();
  const value = program();
  return value;
  
  function check(kind) { return lookahead.kind === kind; }
  function match(kind) {
    if (check(kind)) {
      lookahead = nextToken();
    }
    else {
      console.error(`expecting ${kind} at ${lookahead.kind}`);
      process.exit();
      
    }
  }
  
  function nextToken() {
    return (
      (index >=  tokens.length) ? new Token('EOF', '<EOF>') : tokens[index++]
      );
    }
    
    
    function program() {
      const asts = [];
      while (!check('EOF')) {
        asts.push(source());
      }
      return asts;
    }
    
    function source(){
      
      let asts = [];
      if(check('TEXT')){
        let value = lookahead.lexeme;
        
        const ast = new TextAst();
        ast.tag = lookahead.kind
        ast.value = value;
        match('TEXT');
        return ast;
        
        
      }
      if(check('IFDEF') || check('IFNDEF')){
        
        let tag = lookahead.kind;
        const node = new Ast();
        node.tag = tag;
        node.kids =  [];
        match(tag);
        if(check('SYM')){
          node.sym = lookahead.lexeme;
          match('SYM');
          node.kids.push(source());
          if(check('ELIF')){
            const child = new Ast();
            child.tag = 'ELIF';
            child.kids = [];
            match('ELIF');
            
            if(check('SYM')){
              child.sym = lookahead.lexeme;
              match('SYM'); 
              child.kids.push( source());
              node.kids.push(child);
            }
            
            
          }else{
            if(check('ENDIF')){
              match('ENDIF');
            }
            if(check('ELIF')){
              const child = new Ast();
              child.tag = 'ELIF';
              child.kids = [];
              match('ELIF');
              
              if(check('SYM')){
                child.sym = lookahead.lexeme;
                match('SYM'); 
                child.kids.push( source());
                node.kids.push(child);
              }
              
              
            }if(check('ELSE')){
              const child = new Ast();
              child.tag = lookahead.kind;
              child.kids = [];
              match('ELSE');
              
              child.kids.push(source());
              node.kids.push(child);
              
            }
          }
        }
        
        asts.push(node);
        return asts;
      }else{
        lookahead = nextToken();
      }
      
    }
    
    
    
  }
  
  
  
  function scan(text) {
    const tokens = [];
    let lexemes = '';
    let isText = true; 
    while (text.length > 0) {
      let m;  //m[0] will contain lexeme after successful match
      if((m = text.match(/^\s+/))){
        text = text.substring(m[0].length);}
        
        else if(m = text.match(/^\d+/)){
          text = text.substring(m[0].length);}
          
          else if(m = text.match(/^\#else/)){
            
            tokens.push(new Token('ELSE', m[0]));
            text = text.substring(m[0].length);
            
          }else if(m = text.match(/^\#ifdef/)){
            tokens.push(new Token('IFDEF', m[0]));
            text = text.substring(m[0].length);

            if(m = text.match(/^(\s+)*\w+(\s+)*/)){
              tokens.push(new Token('SYM', m[0]));
              text = text.substring(m[0].length);
            }
            
          }else if(m = text.match(/^\#ifndef/)){
            
            tokens.push(new Token('IFNDEF', m[0]));
            text = text.substring(m[0].length);
            if(m = text.match(/^(\s+)*\w+(\s+)*/)){
              tokens.push(new Token('SYM', m[0]));
              text = text.substring(m[0].length);
            }
            
          }else if(m = text.match(/^\#elif/)){
            
            tokens.push(new Token('ELIF', m[0]));
            text = text.substring(m[0].length);
            if(m = text.match(/^(\s+)*\w+(\s+)*/)){
              tokens.push(new Token('SYM', m[0]));
              text = text.substring(m[0].length);
            }
            
          }else if(m = text.match(/^\#endif/)){
            
            tokens.push(new Token('ENDIF', m[0]));
            text = text.substring(m[0].length);
            
          }
          
          else if(m = text.match(/^\w+/)){
            isText = true;
            while(isText){
              
              if(m = text.match(/^(\s+)*\w+(\s+)*/)){
                lexemes = lexemes + m[0];
                text = text.substring(m[0].length);
              }else {
                isText = false;
                tokens.push(new Token('TEXT',lexemes));
                lexemes = '';
              }
            }
            
          }
          else {
            m = text.match(/^./);
            text = text.substring(m[0].length);
          }
        }
        return tokens;
      }
      
      
      const CHAR_SET = 'utf8';
      function main() {
        if (process.argv.length !== 4) usage();
        const file = process.argv[3];
        const text = fs.readFileSync(file, CHAR_SET);
        let value = null; 
        if(process.argv[2]=='parse'){
          value = parse(text);
        }
        if(process.argv[2]=='scan'){
          value = scan(text);
        }
        
        console.log(JSON.stringify(value));
        
      }
      
      function usage() {
        const prog = Path.basename(process.argv[2])
        console.error(`usage: ${prog} INPUT_FILE`);
        process.exit(1);
      }
      
      class Token {
        constructor(kind, lexeme) {
          Object.assign(this, {kind, lexeme});
        }
      }
      class Ast {
        constructor(sym,tag,kids) {
          Object.assign(this, {sym,tag,kids});
        }
      }
      class TextAst{
        constructor(tag, text) {
          Object.assign(this, {tag, text});
        }
      }
      main();
      
      
      
      
      