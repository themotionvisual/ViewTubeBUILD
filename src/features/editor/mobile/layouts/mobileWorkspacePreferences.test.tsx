// @vitest-environment jsdom
import React,{act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {afterEach,beforeEach,describe,expect,it} from 'vitest';
import {useMobileWorkspacePreferences} from './mobileWorkspacePreferences';

const portraitKey='viewtube.mobile.workspace.v2.portrait.9x16';
const landscapeKey='viewtube.mobile.workspace.v2.landscape.9x16';
let host:HTMLDivElement;
let root:Root;

function Probe({orientation}:{orientation:'portrait'|'landscape'}){
  const[prefs,patch]=useMobileWorkspacePreferences(orientation,true);
  return <div data-page={prefs.lastPage} data-map={String(prefs.showMap)}>
    <button onClick={()=>patch({lastPage:'effects',showMap:true})}>Change portrait</button>
  </div>;
}

beforeEach(()=>{
  localStorage.clear();
  host=document.createElement('div');
  document.body.appendChild(host);
  root=createRoot(host);
});

afterEach(()=>{
  act(()=>root.unmount());
  host.remove();
  localStorage.clear();
});

describe('mobile editor workspace preferences',()=>{
  it('keeps each phone orientation settings when rotating and editing',()=>{
    localStorage.setItem(portraitKey,JSON.stringify({lastPage:'text',showMap:false}));
    localStorage.setItem(landscapeKey,JSON.stringify({lastPage:'audio',showMap:true}));

    act(()=>root.render(<Probe orientation="portrait"/>));
    expect(host.firstElementChild?.getAttribute('data-page')).toBe('text');

    act(()=>root.render(<Probe orientation="landscape"/>));
    expect(host.firstElementChild?.getAttribute('data-page')).toBe('audio');
    expect(JSON.parse(localStorage.getItem(landscapeKey)??'{}').lastPage).toBe('audio');

    act(()=>root.render(<Probe orientation="portrait"/>));
    act(()=>host.querySelector('button')?.dispatchEvent(new MouseEvent('click',{bubbles:true})));
    expect(host.firstElementChild?.getAttribute('data-page')).toBe('effects');
    expect(JSON.parse(localStorage.getItem(portraitKey)??'{}').lastPage).toBe('effects');
    expect(JSON.parse(localStorage.getItem(landscapeKey)??'{}').lastPage).toBe('audio');
  });
});
