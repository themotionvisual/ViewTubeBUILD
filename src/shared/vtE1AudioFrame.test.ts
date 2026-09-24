import {describe,expect,it} from 'vitest';
import {resolveVtE1AudioFrame} from './vtE1AudioFrame.js';

describe('VT_E1 preview/final audio frame contract',()=>{
  it('evaluates volume keyframes with the shared interpolation contract',()=>{
    const clip={
      keyframes:[
        {offsetSec:0,values:{volume:1},interp:'linear'},
        {offsetSec:2,values:{volume:0.5},interp:'linear'},
      ],
    };
    expect(resolveVtE1AudioFrame({},clip,1,4).rawVolume).toBeCloseTo(.75,8);
  });

  it('applies deterministic fade-in and fade-out envelopes',()=>{
    const payload={volume:.8,fadeInSec:2,fadeOutSec:2};
    expect(resolveVtE1AudioFrame(payload,{},1,8).volume).toBeCloseTo(.4,8);
    expect(resolveVtE1AudioFrame(payload,{},4,8).volume).toBeCloseTo(.8,8);
    expect(resolveVtE1AudioFrame(payload,{},7,8).volume).toBeCloseTo(.4,8);
  });

  it('mutes without deleting visual-track state',()=>{
    const frame=resolveVtE1AudioFrame({volume:.9}, {}, 1, 4, true);
    expect(frame.muted).toBe(true);
    expect(frame.volume).toBe(0);
  });

  it('normalizes playback rate and preserved pan metadata',()=>{
    expect(resolveVtE1AudioFrame({playbackRate:8,pan:-2}, {}, 0, 4)).toMatchObject({
      playbackRate:4,
      pan:-1,
    });
    expect(resolveVtE1AudioFrame({}, {playbackRate:.05}, 0, 4).playbackRate).toBe(.1);
  });
});
