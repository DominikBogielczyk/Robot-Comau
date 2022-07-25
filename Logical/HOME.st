VAR

	A : McAxisTargetType := (JointAxis:=[0, 0, -90, 0, 90, 0], SlaveAxis:=[100]);

END_VAR

	PROGRAM _MAIN 
	
	Feedrate(2000);    //move with reduced speed      
	MoveA(A); //move HOME
	END_PROGRAM