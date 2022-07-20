
TYPE
	Safety_type : 	STRUCT  (*Struktura Safety. Logika: 0 - E-Stop wcisniety / Klatka otwarta*)
		EStop : BOOL; (*Stan Safety: E-Stop na klatce*)
		EStopPanel : BOOL; (*Stan Safety:  E-Stop na panelu*)
		GuardingDoor : BOOL; (*Stan Safety:  Drzwi klatki*)
		diEStop : BOOL; (*Stan wejscia: E-Stop na klatce*)
		diEStopPanel : BOOL; (*Stan wejscia: E-Stop na panelu*)
		diGuardDoor1 : BOOL; (*Stan wejscia: Drzwi klatki - kanal 1*)
		diGuardDoor2 : BOOL; (*Stan wejscia: Drzwi klatki - kanal 2*)
		SafeChannelOK1 : BOOL; (*Stan poprawnego dzialania SO1*)
		SafeChannelOK2 : BOOL; (*Stan poprawnego dzialania SO2*)
		doAcoposEnable1 : BOOL; (*Stan wyjsc Safety (Enable Acoposa 1)*)
		doAcoposEnable2 : BOOL; (*Stan wyjsc Safety (Enable Acoposa 2)*)
	END_STRUCT;
END_TYPE
