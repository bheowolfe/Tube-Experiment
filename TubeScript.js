
var canvas;
var gl;

var points = [];
var colors = [];

var obList = [];
var obNum = 0;
var scal = [0.4,0.4,0.4];
var trans1 = [-0.5,-0.4,0];
var trans2 = [0.5,-0.5,0];


function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	//var do1 = Donut();
	var do2 = Donut2();
	//obListAdd(do1);
	objectTranslate(do2,trans1);
	objectScale(do2,scal);
	obListAdd(do2);
	objectRotateY(do2,Math.PI);
	objectRotateX(do2,Math.PI/4);
	objectRotateZ(do2,Math.PI/3);
	
	knit();
	
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    // enable hidden-surface removal
    
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	thetaLoc = gl.getUniformLocation(program, "uTheta");
	
	
    render();
};

function myFunction() {
  alert("Hello! I am an alert box!");
}

//add object to list of objects to render
function obListAdd(x) {
	obList[obNum] = x;
	obNum++;
}

//create triangles for all objects in obList
function knit() {
	//alert('test knit');
	for(let i=0; i<obList.length; i++){
		//alert('test knit 2');
		for(let j=1; j<obList[i].length-1; j++){
			stitch1(obList[i][j],obList[i][j+1],1);
		}
	}
	//alert('test knit final');
}

//create triangle out of three points and put into points array	
function triangle( a, b, c, color ){
	//alert('test triangle');
    // add colors and vertices for one triangle

    var baseColors = [
        vec3(0.0, 0.0, 0.0),
		vec3(1.0, 0.8, 0.0),
		vec3(0.0, 1.0, 0.8),
        vec3(0.8, 0.64, 0.0),
		vec3(0.0, 0.8, 0.64),
        vec3(0.5, 0.4, 0.0),
        vec3(0.0, 0.5, 0.4)
    ];
	
	var s1 = a[0];
	var s2 = a[1];
	var s3 = a[2];
	
	s1 = b[0];
	s2 = b[1];
	s3 = b[2];
	
	s1 = c[0];
	s2 = c[1];
	s3 = c[2];

    colors.push( baseColors[color] );
    points.push( a );
    colors.push( baseColors[color] );
    points.push( b );
    colors.push( baseColors[color] );
    points.push( c );
}

//creates order that the points on two sets of rings need
//to be entered in to make an enclosed loop part1
function stitch1( a, b, num){
	//alert('test stitch 1');
	if ( num === a.length-1 ) {
		//alert('test final stitch');
		triangle(a[num],b[num],a[1],num);
		triangle(b[num],a[1],b[1],num);
		//triangle(a[1],a[3],a[2],0);
		//triangle(b[1],b[3],b[2],0);
	}
	else{
		triangle(a[num],b[num],a[num+1],num);
		stitch2(a,b,num);
	}
}

//part 2
function stitch2( a, b, num){
	triangle(b[num],a[num+1],b[num+1],num);
	num = num + 1;
	stitch1(a,b,num);
}

//changes size of a loop
function scale(v,s){
	var r = [];
	translateCenter(v);
	for (let i = 1; i<v.length; i++){
		r[i] = vec3( v[i][0]*s[0], v[i][1]*s[1], v[i][2]*s[2]);
	}
	restoreTranslation(v,r);
	return r;
}

//changes size of the object
function objectScale(o,s){
	for (let i = 1; i<o.length; i++){
		for (let j = 1; j<o[i].length; j++){
			o[i][j] = vec3( o[i][j][0]-o[0][0], o[i][j][1]-o[0][1], o[i][j][2]-o[0][2]);
			o[i][j] = vec3( o[i][j][0]*s[0], o[i][j][1]*s[1], o[i][j][2]*s[2]);
			o[i][j] = vec3( o[i][j][0]+o[0][0], o[i][j][1]+o[0][1], o[i][j][2]+o[0][2]);
		}
	}
}

//rotates a loop around the x axis of its central point
function rotateX(v,d)
{
	var r = [];
	translateCenter(v);
	var cos = Math.cos(d);
	var sin = Math.sin(d);
	for (let i = 1; i<v.length; i++){
		r[i] = vec3( v[i][0], v[i][1]*cos-v[i][2]*sin, v[i][1]*sin+v[i][2]*cos);
	}
	restoreTranslation(v,r);
	//alert('test1');
	return r;
}

//rotates an object around the x axis of its center point
function objectRotateX(o,d){
	var cos = Math.cos(d);
	var sin = Math.sin(d);
	for (let i = 1; i<o.length; i++){
		for (let j = 1; j<o[i].length; j++){
			o[i][j] = vec3( o[i][j][0]-o[0][0], o[i][j][1]-o[0][1], o[i][j][2]-o[0][2]);
			o[i][j] = vec3( o[i][j][0], o[i][j][1]*cos-o[i][j][2]*sin, o[i][j][1]*sin+o[i][j][2]*cos);
			o[i][j] = vec3( o[i][j][0]+o[0][0], o[i][j][1]+o[0][1], o[i][j][2]+o[0][2]);
		}
	}
}

//rotates a loop around the y axis of its central point
function rotateY(v,d){
	var r = [];
	translateCenter(v);
	var cos = Math.cos(d);
	var sin = Math.sin(d);
	for (let i = 1; i<v.length; i++){
		r[i] = vec3( v[i][2]*sin+v[i][0]*cos, v[i][1], v[i][2]*cos-v[i][0]*sin);
	}
	restoreTranslation(v,r);
	return r;
}

//rotates an object around the y axis of its center point
function objectRotateY(o,d){
	var cos = Math.cos(d);
	var sin = Math.sin(d);
	for (let i = 1; i<o.length; i++){
		for (let j = 1; j<o[i].length; j++){
			o[i][j] = vec3( o[i][j][0]-o[0][0], o[i][j][1]-o[0][1], o[i][j][2]-o[0][2]);
			o[i][j] = vec3( o[i][j][2]*sin+o[i][j][0]*cos, o[i][j][1], o[i][j][2]*cos-o[i][j][0]*sin);
			o[i][j] = vec3( o[i][j][0]+o[0][0], o[i][j][1]+o[0][1], o[i][j][2]+o[0][2]);
		}
	}
}

//rotates a loop around the z axis of its central point
function rotateZ(v,d){
	var r = [];
	translateCenter(v);
	var cos = Math.cos(d);
	var sin = Math.sin(d);
	for (let i = 1; i<v.length; i++){
		r[i] = vec3( v[i][0]*cos-v[i][1]*sin, v[i][0]*sin+v[i][1]*cos, v[i][2]);
	}
	restoreTranslation(v,r);
	return r;
}

//rotates an object around the z axis of its center point
function objectRotateZ(o,d){
	var cos = Math.cos(d);
	var sin = Math.sin(d);
	for (let i = 1; i<o.length; i++){
		for (let j = 1; j<o[i].length; j++){
			o[i][j] = vec3( o[i][j][0]-o[0][0], o[i][j][1]-o[0][1], o[i][j][2]-o[0][2]);
			o[i][j] = vec3( o[i][j][0]*cos-o[i][j][1]*sin, o[i][j][0]*sin+o[i][j][1]*cos, o[i][j][2]);
			o[i][j] = vec3( o[i][j][0]+o[0][0], o[i][j][1]+o[0][1], o[i][j][2]+o[0][2]);
		}
	}
}

//moves loop in direction based on vector given
function translate(v,s){
	//alert('test2');
	var r = [];
	for (let i = 0; i<v.length; i++){
		r[i] = vec3( v[i][0]+s[0], v[i][1]+s[1], v[i][2]+s[2]);
	}
	return r;
}

//moves loop so that is center would be around 0,0,0 but not actually change
//center point to make minipulation easier
function translateCenter(v){
	for (let i = 1; i<v.length; i++){
		v[i] = vec3( v[i][0]-v[0][0], v[i][1]-v[0][1], v[i][2]-v[0][2]);
	}
}

//moves loop so that its actual center matches its actual center from 0,0,0
function restoreTranslation(v,r){
	for (let i = 1; i<v.length; i++){
		v[i] = vec3( v[i][0]+v[0][0], v[i][1]+v[0][1], v[i][2]+v[0][2]);
		r[i] = vec3( r[i][0]+v[0][0], r[i][1]+v[0][1], r[i][2]+v[0][2]);
	}
	r[0] = [];
	r[0][0] = v[0][0];
	r[0][1] = v[0][1];
	r[0][2] = v[0][2];
}

//move and entire object
function objectTranslate(o,s){
	o[0] = vec3( o[0][0]+s[0], o[0][1]+s[1], o[0][2]+s[2]);
	for (let i = 1; i<o.length; i++){
		for (let j = 0; j<o[i].length; j++){
			o[i][j] = vec3( o[i][j][0]+s[0], o[i][j][1]+s[1], o[i][j][2]+s[2]);
		}
	}
}

//makes a ring object
function Donut(){
	var donut = [];
	donut[0] = vec3( 0.0000,0.0000,0.0000);
	
	var vertices = [
		vec3(  0.0000,  0.0000,  0.0000 ),
        vec3(  0.0000,  0.9428,  0.0000 ),
		vec3( -0.8165,  0.4714,  0.0000 ),
        vec3( -0.8165, -0.4714,  0.0000 ),
		vec3(  0.0000, -0.9428,  0.0000 ),
        vec3(  0.8165, -0.4714,  0.0000 ),
		vec3(  0.8165,  0.4714,  0.0000 )
    ];
	
	var vertP = rotateX(scale(rotateY(vertices,Math.PI/2), scal), Math.PI/4);
	
	
	var tr1 = [0.0,0.5,0];
	var ro1 = 0;
	var tr2 = [-0.5,0,0];
	var ro2 = Math.PI/2;
	var tr3 = [0,-0.5,0];
	var ro3 = Math.PI;
	var tr4 = [0.5,0,0];
	var ro4 = Math.PI * 1.5;
	
	donut[1] = translate(rotateZ(vertP,ro1), tr1);
	donut[2] = translate(rotateZ(vertP,ro2), tr2);
	donut[3] = translate(rotateZ(vertP,ro3), tr3);
	donut[4] = translate(rotateZ(vertP,ro4), tr4);
	donut[5] = translate(rotateZ(vertP,ro1), tr1);
	return donut;
}

function Donut2(){
	var donut = [];
	donut[0] = vec3( 0.0000,0.0000,0.0000);
	
	var vertices = [
		vec3(  0.0000,  0.0000,  0.0000 ),
        vec3(  0.0000,  0.9428,  0.0000 ),
		vec3( -0.8165,  0.4714,  0.0000 ),
        vec3( -0.8165, -0.4714,  0.0000 ),
		vec3(  0.0000, -0.9428,  0.0000 ),
        vec3(  0.8165, -0.4714,  0.0000 ),
		vec3(  0.8165,  0.4714,  0.0000 )
    ];
	
	var vertP = scale(rotateY(vertices,Math.PI/2), scal);
	
	for (let i = 0; i<=24; i++){
		var ro = Math.PI*(i/12);
		var tr = vec3( Math.cos(ro)/2, Math.sin(ro)/2, 0);
		donut[i+1] = translate(rotateZ(vertP,(Math.PI/2)+ro), tr);
	}
	
	return donut;
}

window.onload = init

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
	points = [];
}
