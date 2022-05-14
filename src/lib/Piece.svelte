<script>
import { arc } from 'd3-shape';
export let x =0
export let y =0
export let dx =0
export let dy =0
export let pieceRotaton = 0
export let seamAllowance = 0
export let hemAllowance = 0
export let startAngle = 0 
export let endAngle = 0
export let innerRadius = 0
export let outerRadius = 0
export let transform=""

// $:console.log({innerRadius,outerRadius})


let path = (pieceRotation)=>arc()(
  {
    innerRadius,
    outerRadius,
    startAngle: startAngle + pieceRotaton,
    endAngle: endAngle + pieceRotaton
  }
);

// console.log({path})

const centroid =  () => arc().centroid({
    innerRadius,
    outerRadius,
    startAngle: startAngle + pieceRotaton,
    endAngle: endAngle + pieceRotaton
  });


let csa = function (pieceRotation) {
  //curved seam/hem allowances (top and bottom)
  let waist = arc()({
    innerRadius: innerRadius - seamAllowance,
    outerRadius: innerRadius,
    startAngle: startAngle + pieceRotaton,
    endAngle: endAngle + pieceRotaton
  });
  let hem = arc()({
    innerRadius: outerRadius,
    outerRadius: outerRadius + hemAllowance,
    startAngle: startAngle + pieceRotaton,
    endAngle: endAngle + pieceRotaton
  });

  return [
    { name: 'waist', path: waist },
    { name: 'hem', path: hem }
  ];
};
let ssa = function (pieceRotation) {
  //straight seam allowances (sides)
  let height = seamAllowance + hemAllowance + outerRadius - innerRadius;
  let width = seamAllowance;

  let x1 =
    (innerRadius - seamAllowance) * Math.sin(startAngle + pieceRotaton);
  let y1 =
    (innerRadius - seamAllowance) * -1 * Math.cos(startAngle + pieceRotaton);

  let transform1 =
    'translate(' +
    x1 +
    ',' +
    y1 +
    ') rotate(' +
    (180 * (startAngle + pieceRotaton - Math.PI)) / Math.PI +
    ')';

  let x2 =
    (innerRadius - seamAllowance) * Math.sin(endAngle + pieceRotaton) +
    seamAllowance * Math.cos(endAngle + pieceRotaton);
  let y2 =
    (innerRadius - seamAllowance) * -1 * Math.cos(endAngle + pieceRotaton) +
    seamAllowance * Math.sin(endAngle + pieceRotaton);

  let transform2 =
    'translate(' +
    x2 +
    ',' +
    y2 +
    ') rotate(' +
    (180 * (endAngle + pieceRotaton - Math.PI)) / Math.PI +
    ')';

  return [
    { name: 'start', height: height, width: width, transform: transform1 },
    { name: 'end', height: height, width: width, transform: transform2 }
  ];
};

let oldCentroid =centroid()
let newCentroid =[0,0]

let mouseHasMoved = false

const piece_rotate = ()=>{
    if(!mouseHasMoved){
      oldCentroid = centroid()
      pieceRotaton = pieceRotaton + Math.PI/4
      newCentroid = centroid()
      const _dx=oldCentroid[0]-newCentroid[0]
      const _dy=oldCentroid[1]-newCentroid[1]
      dx=dx+_dx
      dy=dy+_dy
    }
    mouseHasMoved = false
	}

  let dragging = false

  const dragstart = ()=>{
    dragging = true
  }
  const dragend = ()=>{
    dragging = false 
  }

	const drag = (e)=>{
    if(dragging){
      mouseHasMoved = true
      dx=dx+e.movementX
		  dy=dy+e.movementY
    }
	}

	const piece_transform = (x,dx,y,dy) => {
    return `translate(${x+dx},${(-1*y)+dy})`
	}

  // $: transform = piece_transform(x,dx,y,dy) 
  
</script>

<g transform ={piece_transform(x,dx,y,dy)}>
  <path class=main 
    d={path(pieceRotaton)} 
    on:mousedown={dragstart} 
    on:mouseup={dragend}
    on:mousemove={drag}  
    on:click={piece_rotate}
    />
  {#each csa(pieceRotaton) as csa}
    <path class=csa d={csa.path} />
  {/each}
  {#each ssa(pieceRotaton) as {height,width,transform}}
    <rect class=ssa {height} {width} {transform}/>
  {/each}
</g>


<style lang=scss>
  .main{
    stroke:none;
    fill:hotpink;
    fill-opacity: 0.5;
  }
  .csa,.ssa{
    stroke:none;
    fill:teal;
    fill-opacity: 0.5;
  }

</style>