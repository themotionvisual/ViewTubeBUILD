import {describe,expect,it} from 'vitest';
import {capabilityById,capabilityStatusForSurface} from './editorCapabilities';

describe('editor capability surface truth',()=>{
  it('does not advertise FX parity on desktop before the desktop host is wired',()=>{
    expect(capabilityStatusForSurface('effects.color','desktop')).toBe('planned');
    expect(capabilityStatusForSurface('effects.blur','desktop')).toBe('planned');
  });

  it('records the currently verified mobile preview and final-render FX surfaces',()=>{
    for(const id of ['effects.color','effects.blur']){
      expect(capabilityStatusForSurface(id,'mobile')).toBe('active');
      expect(capabilityStatusForSurface(id,'preview')).toBe('active');
      expect(capabilityStatusForSurface(id,'render')).toBe('active');
    }
  });

  it('keeps detailed color controls discoverable without inventing separate unsupported tools',()=>{
    expect(capabilityById('effects.color')?.keywords).toEqual(
      expect.arrayContaining(['saturation','brightness','hue','contrast','sepia','grayscale','opacity']),
    );
  });
});
