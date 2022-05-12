import { writable,derived } from 'svelte/store';
import { types } from '$lib/skirt_types'
import { scaleLinear } from 'd3-scale';

let defaultSkirt = {
  type: 0,
  waistMeasurement: 80,
  skirtLength: 50,
  seamAllowance: 1.5,
  hemAllowance: 1.5,
  fabricWidth: 112
};

export function newSkirt(_skirt=defaultSkirt){
  const _pieces = ([skirt,xscale]) => {return types[skirt.type].layoutGenerator(skirt,xscale)} 
  const scale = scaleLinear()
  const skirt = writable(_skirt)
  const newXscale = function(){
    const { subscribe, set, update } = writable(scale)  
    return {
      subscribe,
      set,
      update,
      range:(range)=>{
        if(range){
          scale.range(range)
          set(scale)
          return range
        } else return scale.range()
      },
      domain:(domain)=>{
        if(domain){
          scale.domain(domain)
          set(scale)
          return domain
        } else return scale.domain()
      }
    }
  }
  const xscale = newXscale()
  const pieces = derived([skirt,xscale],_pieces)

  return{ skirt, xscale, pieces }
}

