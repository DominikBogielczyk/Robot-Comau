VAR {AT PLC} 
P2up : McPointType;
P2 : McPointType;
P1up : McPointType;
P1 : McPointType;
P0 : McPointType;
HOME : McPointType;
PZ : McPointType;
A : McAxisTargetType;

END_VAR

	PROGRAM _MAIN 
	
	Feedrate(5000);    //move with reduced speed      

	MoveA(A); //move HOME

//	MoveJ(P0);   //move to lower HOME pose

	MoveL(P1up); //move over the aim 1 pose
	Feedrate(2000);

	MoveL(P1);  //move to aim 1
	WaitTime(1);        
	MoveL(P1up); //move over the aim 1 pose
	Feedrate(5000);	
	MoveL(P2up); //move over the aim 2 pose
	Feedrate(2000);

	MoveL(P2);    //move to aim 2
	WaitTime(1);
	MoveL(P2up); //move over the aim 2 pose
	Feedrate(2000);	

//	MoveL(P0);   //move to lower HOME pose
	MoveJ(HOME); //move to  HOME

END_PROGRAM