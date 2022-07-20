VAR
	HOME : McPointType := (Pos:=(X:=435,Y:=0,Z:=685),Orient:=(Angle1:=0,Angle2:=90,Angle3:=0));
	P0 : McPointType := (Pos:=(X:=435,Y:=0,Z:=405),Orient:=(Angle1:=0,Angle2:=180,Angle3:=0));
	P1up : McPointType := (Pos:=(X:=510,Y:=-300,Z:=200),Orient:=(Angle1:=0,Angle2:=180,Angle3:=0));
	P1 : McPointType := (Pos:=(X:=510,Y:=-300,Z:=100),Orient:=(Angle1:=0,Angle2:=180,Angle3:=0));
	P2up : McPointType := (Pos:=(X:=410,Y:=200,Z:=200),Orient:=(Angle1:=0,Angle2:=180,Angle3:=0));
	P2 : McPointType := (Pos:=(X:=410,Y:=200,Z:=100),Orient:=(Angle1:=0,Angle2:=180,Angle3:=0));
	
END_VAR

PROGRAM _MAIN          
 Feedrate(3500);    //move with reduced speed      
 MoveJ(HOME); 
 MoveJ(P0);        //move system to point P2 
 MoveL(P1up);        //move system to point Home     
 MoveL(P1);
 WaitTime(3);        //wait for 3 seconds 
 MoveL(P1up);
 MoveL(P2up);
 MoveL(P2);
 WaitTime(3);
 MoveL(P2up);
 MoveL(P0);
 MoveJ(HOME);

END_PROGRAM