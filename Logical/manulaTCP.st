#include 'Global.var'
VAR {AT 'Comau'}
X1 : LREAL;
Y1 : LREAL;
Z1 : LREAL;
A1 : LREAL;
B1 : LREAL;
C1 : LREAL;
END_VAR

	PROGRAM _MAIN          
	Feedrate(3500);    //move with reduced speed      
	PZ.Orient.Angle1 := A1;
	PZ.Orient.Angle3 := C1;
	PZ.Orient.Angle2 := B1;
	PZ.Pos.X := X1;
	PZ.Pos.Y := Y1;
	PZ.Pos.Z := Z1;
	MoveJ(PZ);

	END_PROGRAM