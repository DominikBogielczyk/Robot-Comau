
PROGRAM _INIT
	
	// Deklaracja podstawowych parametrow sesji klienta OPC UA
	SessionConnectInfo_0.SecurityMsgMode := UASecurityMsgMode_None;
	SessionConnectInfo_0.SecurityPolicy := UASecurityPolicy_None;
	SessionConnectInfo_0.TransportProfile := UATP_UATcp;
	SessionConnectInfo_0.UserIdentityToken.UserIdentityTokenType := UAUITT_Username;
	SessionConnectInfo_0.UserIdentityToken.TokenParam1 := 'admin';
	SessionConnectInfo_0.UserIdentityToken.TokenParam2 := 'password';
	SessionConnectInfo_0.SessionTimeout := T#1m;
	SessionConnectInfo_0.MonitorConnection := T#10s;
	 
END_PROGRAM

PROGRAM _CYCLIC
	
	// Wywolanie funkcji polaczenia z serwerem
	UA_Connect_0(Execute := ExecuteConnect_0,
		ServerEndpointUrl := 'opc.tcp://192.168.0.115:4841',
	SessionConnectInfo := SessionConnectInfo_0,
	Timeout := T#10s); 
	
//	UA_Connect_0(Execute := ExecuteConnect_0,
//		ServerEndpointUrl := 'opc.tcp://192.168.0.150:4841',
//	SessionConnectInfo := SessionConnectInfo_0,
//	Timeout := T#10s);
	
	// Wywolanie funkcji pobrania Namespace serwera
	UA_GetNamespaceIndex_0(Execute := ExecuteGetnamespaceindex_0,
		ConnectionHdl := ConnectionHdl,
		NamespaceUri := 'urn:B&R/pv/',
	Timeout := T#5s);
	
	// Wywolanie funkcji tworzacej uchtywy do zmiennych
	UA_NodeGetHandleList_0(Execute := ExecuteNodeGetHandleList_0,
		ConnectionHdl := ConnectionHdl,
		NodeIDCount := 11,
		NodeIDs := NodeIDs_0,
		Timeout := T#10s);
	
	// Odczyt poszczegolnych stanow zmiennych z serwera (sterownika safety)
	UA_ReadList_0(Execute := ExecuteReadList_0,
		ConnectionHdl := ConnectionHdl,
		NodeHdlCount := 11,
		NodeHdls := NodeHdls,
		NodeAddInfo := NodeAddInfo_0,
		Timeout := T#10s,
	Variables := Variables_Rd0);
	
	// Implementacja funkcjonalnosci zwolnienia uchyty - nie wykorzystywana, lecz mozliwa do wywolania
	UA_NodeReleaseHandleList_0(Execute := ExecuteNodeReleaseHandleList_0,
		ConnectionHdl := ConnectionHdl,
		NodeHdlCount := 11,
		NodeHdls := NodeHdls,
		Timeout := T#10s);

	// Implementacja funkcjonalnosci rozlaczenia polaczenia z serwerem - nie wykorzystywana, lecz mozliwa do wywolania
	UA_Disconnect_0(Execute := ExecuteDisconnect_0,
		ConnectionHdl := ConnectionHdl,
		Timeout := T#10s);
	
	CASE ActState OF
		STATE_IDLE:
		
				// Rozpoczecie wykonywania sekwencji odczytu danych
				ActState := STATE_CONNECT;
				ExecuteConnect_0 := TRUE;
			
		STATE_CONNECT:
			
			// UA_Connect - realizuje polaczenie z serwerem OPC UA
			IF (UA_Connect_0.Busy = 0) THEN
				ExecuteConnect_0 := 0;
				IF (UA_Connect_0.Done = 1) THEN								// Operacja wykonana poprawnie - wywolanie i przejscie do kolejnego kroku
					ErrorID := 0;
					ConnectionHdl := UA_Connect_0.ConnectionHdl;
					ExecuteGetnamespaceindex_0 := TRUE;
					ActState := STATE_GET_NAMESPACE;
				END_IF
				IF (UA_Connect_0.Error = 1) THEN							// Operacja nieudana (blad) - obsluga bledow
					ErrorID := UA_Connect_0.ErrorID;
					ConnectionHdl := 0;
					ActState := STATE_ERROR;
				END_IF
			END_IF
			
		STATE_GET_NAMESPACE:
			
			// UA_GetNamespaceIndex - odczytanie indeksow poszczegolnych przestrzeni nazw serwera		
			IF (UA_GetNamespaceIndex_0.Busy = 0) THEN
				ExecuteGetnamespaceindex_0 := 0;
				IF (UA_GetNamespaceIndex_0.Done = 1) THEN
					ErrorID:= 0;
					NamespaceIndex := UA_GetNamespaceIndex_0.NamespaceIndex;
					ExecuteNodeGetHandleList_0 := TRUE;
					
					// Przypisanie poszczegolnych przestrzeni nazw z serwera odpowiednim indeksa
					NodeIDs_0[0].NamespaceIndex := NamespaceIndex;
					NodeIDs_0[0].Identifier := '::SafetyProg:EStop';
					NodeIDs_0[0].IdentifierType := UAIdentifierType_String;

					NodeIDs_0[1].NamespaceIndex := NamespaceIndex;
					NodeIDs_0[1].Identifier := '::SafetyProg:EStopPanel';
					NodeIDs_0[1].IdentifierType := UAIdentifierType_String;

					NodeIDs_0[2].NamespaceIndex := NamespaceIndex;
					NodeIDs_0[2].Identifier := '::SafetyProg:GuardDoor';
					NodeIDs_0[2].IdentifierType := UAIdentifierType_String;
					
					NodeIDs_0[3].NamespaceIndex := NamespaceIndex;
					NodeIDs_0[3].Identifier := '::SafetyProg:diEStop';
					NodeIDs_0[3].IdentifierType := UAIdentifierType_String;
					
					NodeIDs_0[4].NamespaceIndex := NamespaceIndex;
					NodeIDs_0[4].Identifier := '::SafetyProg:diEStopPanel';
					NodeIDs_0[4].IdentifierType := UAIdentifierType_String;
					
					NodeIDs_0[5].NamespaceIndex := NamespaceIndex;
					NodeIDs_0[5].Identifier := '::SafetyProg:diGuardDoor1';
					NodeIDs_0[5].IdentifierType := UAIdentifierType_String;
					
					NodeIDs_0[6].NamespaceIndex := NamespaceIndex;
					NodeIDs_0[6].Identifier := '::SafetyProg:diGuardDoor2';
					NodeIDs_0[6].IdentifierType := UAIdentifierType_String;
					
					NodeIDs_0[7].NamespaceIndex := NamespaceIndex;
					NodeIDs_0[7].Identifier := '::SafetyProg:SafeOutputOk1';
					NodeIDs_0[7].IdentifierType := UAIdentifierType_String;
					
					NodeIDs_0[8].NamespaceIndex := NamespaceIndex;
					NodeIDs_0[8].Identifier := '::SafetyProg:SafeOutputOk2';
					NodeIDs_0[8].IdentifierType := UAIdentifierType_String;
					
					NodeIDs_0[9].NamespaceIndex := NamespaceIndex;
					NodeIDs_0[9].Identifier := '::SafetyProg:gdoAcoposEnable1';
					NodeIDs_0[9].IdentifierType := UAIdentifierType_String;
					
					NodeIDs_0[10].NamespaceIndex := NamespaceIndex;
					NodeIDs_0[10].Identifier := '::SafetyProg:gdoAcoposEnable2';
					NodeIDs_0[10].IdentifierType := UAIdentifierType_String;
					
					ActState := STATE_GET_HANDLE;
					
				END_IF
				IF (UA_GetNamespaceIndex_0.Error = 1) THEN
					ErrorID:= UA_GetNamespaceIndex_0.ErrorID;
					NamespaceIndex := 0;
					ActState := STATE_ERROR;
				END_IF
			END_IF
			
		STATE_GET_HANDLE:
			
			// UA_NodeGetHandle - uchyt do noda		
			IF (UA_NodeGetHandleList_0.Busy = 0) THEN
				ExecuteNodeGetHandleList_0 := 0;
				IF (UA_NodeGetHandleList_0.Done = 1) THEN
					ErrorID:= 0;
					NodeHdls := UA_NodeGetHandleList_0.NodeHdls;
					ExecuteReadList_0 := TRUE;
					ActState := STATE_READY_TO_READ;
				END_IF
				IF (UA_NodeGetHandleList_0.Error = 1) THEN
					ErrorID:= UA_NodeGetHandleList_0.ErrorID;
					NodeHdls[0] := 0;
					NodeHdls[1] := 0;
					NodeHdls[2] := 0;
					NodeHdls[3] := 0;
					NodeHdls[4] := 0;
					NodeHdls[5] := 0;
					NodeHdls[6] := 0;
					NodeHdls[7] := 0;
					NodeHdls[8] := 0;
					NodeHdls[9] := 0;
					NodeHdls[10] := 0;
					ActState := STATE_ERROR;
				END_IF
			END_IF		
			
		STATE_READY_TO_READ:
			
			NodeAddInfo_0[0].AttributeId := UAAI_Value;
			NodeAddInfo_0[0].IndexRangeCount := 0;

			NodeAddInfo_0[1].AttributeId := UAAI_Value;
			NodeAddInfo_0[1].IndexRangeCount := 0;

			NodeAddInfo_0[2].AttributeId := UAAI_Value;
			NodeAddInfo_0[2].IndexRangeCount := 0;
			
			NodeAddInfo_0[3].AttributeId := UAAI_Value;
			NodeAddInfo_0[3].IndexRangeCount := 0;
			
			NodeAddInfo_0[4].AttributeId := UAAI_Value;
			NodeAddInfo_0[4].IndexRangeCount := 0;
			
			NodeAddInfo_0[5].AttributeId := UAAI_Value;
			NodeAddInfo_0[5].IndexRangeCount := 0;
			
			NodeAddInfo_0[6].AttributeId := UAAI_Value;
			NodeAddInfo_0[6].IndexRangeCount := 0;
			
			NodeAddInfo_0[7].AttributeId := UAAI_Value;
			NodeAddInfo_0[7].IndexRangeCount := 0;
			
			NodeAddInfo_0[8].AttributeId := UAAI_Value;
			NodeAddInfo_0[8].IndexRangeCount := 0;
			
			NodeAddInfo_0[9].AttributeId := UAAI_Value;
			NodeAddInfo_0[9].IndexRangeCount := 0;
			
			NodeAddInfo_0[10].AttributeId := UAAI_Value;
			NodeAddInfo_0[10].IndexRangeCount := 0;

			// Przypisanie przestrzeni nazw, do ktorych zmienna maja byc zapisywane
			Variables_Rd0[0] := '::OpcCtrl:SafetyLocal.EStop';
			Variables_Rd0[1] := '::OpcCtrl:SafetyLocal.EStopPanel';
			Variables_Rd0[2] := '::OpcCtrl:SafetyLocal.GuardingDoor';
			Variables_Rd0[3] := '::OpcCtrl:SafetyLocal.diEStop';
			Variables_Rd0[4] := '::OpcCtrl:SafetyLocal.diEStopPanel';
			Variables_Rd0[5] := '::OpcCtrl:SafetyLocal.diGuardDoor1';
			Variables_Rd0[6] := '::OpcCtrl:SafetyLocal.diGuardDoor2';
			Variables_Rd0[7] := '::OpcCtrl:SafetyLocal.SafeChannelOK1';
			Variables_Rd0[8] := '::OpcCtrl:SafetyLocal.SafeChannelOK2';
			Variables_Rd0[9] := '::OpcCtrl:SafetyLocal.doAcoposEnable1';
			Variables_Rd0[10] := '::OpcCtrl:SafetyLocal.doAcoposEnable1';
			
			ActState := STATE_READ;
			ExecuteReadList_0 := TRUE;
			
		STATE_READ:
			
			// UA_Read - odczyt danych			
			IF (UA_ReadList_0.Busy = 0) THEN
				ExecuteReadList_0 := 0;
				IF (UA_ReadList_0.Done = 1) THEN
					ErrorID:= 0;
					ActState := STATE_READY_TO_READ;
				END_IF
				IF (UA_ReadList_0.Error = 1) THEN
					ErrorID:= UA_ReadList_0.ErrorID;
					SafetyLocal.EStop := FALSE;
					SafetyLocal.EStopPanel := FALSE;
					SafetyLocal.GuardingDoor := FALSE;
					SafetyLocal.diEStop := FALSE;
					SafetyLocal.diEStopPanel := FALSE;
					SafetyLocal.diGuardDoor1 := FALSE;
					SafetyLocal.diGuardDoor2 := FALSE;
					SafetyLocal.SafeChannelOK1 := FALSE;
					SafetyLocal.SafeChannelOK2 := FALSE;
					SafetyLocal.doAcoposEnable1 := FALSE;
					SafetyLocal.doAcoposEnable2 := FALSE;
					ActState := STATE_ERROR;
				END_IF
			END_IF
			
		STATE_RELEASE_HANDLE:
			
			(* UA_NodeReleaseHandle - release the handle for the node *) 
    
			IF (UA_NodeReleaseHandleList_0.Busy = 0) THEN
				ExecuteNodeReleaseHandleList_0 := 0;
				IF (UA_NodeReleaseHandleList_0.Done = 1) THEN
					ErrorID:= 0;
					NodeHdls[0] := 0;
					NodeHdls[1] := 0;
					NodeHdls[2] := 0;
					NodeHdls[3] := 0;
					NodeHdls[4] := 0;
					NodeHdls[5] := 0;
					NodeHdls[6] := 0;
					NodeHdls[7] := 0;
					NodeHdls[8] := 0;
					NodeHdls[9] := 0;
					NodeHdls[10] := 0;
				END_IF
				IF (UA_NodeReleaseHandleList_0.Error = 1) THEN
					ErrorID:= UA_NodeReleaseHandleList_0.ErrorID;
				END_IF
			END_IF
			
		STATE_DISCONNECT:
			
			(* UA_Disconnect - disconnect from OPC UA Server *)
            
			IF (UA_Disconnect_0.Busy = 0) THEN
				ExecuteDisconnect_0 := 0;
				IF (UA_Disconnect_0.Done = 1) THEN
					ErrorID:= 0;
					ConnectionHdl := 0;
				END_IF
				IF (UA_Disconnect_0.Error = 1) THEN 
					ErrorID:= UA_Disconnect_0.ErrorID;
				END_IF
			END_IF
			
		STATE_ERROR:
			
			// Aktywowanie alarmu o bledzie w komunikacji
			gSafety.CommunicationError := TRUE;
			
			// proba potwierdzenia alarmu
			IF gSafety.ComErrorAck THEN
				gSafety.ComErrorAck := FALSE;
				// Execute = FALSE pozwala na zresetowanie bledow
				ExecuteConnect_0 := FALSE;
				ExecuteGetnamespaceindex_0 := FALSE;
				ExecuteNodeGetHandleList_0 := FALSE;
				ExecuteReadList_0 := FALSE;
				ActState := STATE_BACK_FROM_ERROR;
			END_IF
		
		STATE_BACK_FROM_ERROR:
			
			// Powrot do proby laczenia z serwerem w przypadku, gdy bledy zostaly zresetowane
			IF (NOT UA_Connect_0.Error) AND NOT UA_GetNamespaceIndex_0.Error AND NOT UA_NodeGetHandleList_0.Error AND NOT UA_ReadList_0.Error THEN
//			IF Escape THEN
				ActState := STATE_IDLE;
			END_IF;
		
	END_CASE;
	
	// Zresetowanie alarmu o bledzie w komunikacji
	IF ErrorID = 0 THEN
		gSafety.CommunicationError := FALSE;
	END_IF;
	
	// Przypisanie odpowiednich zmiennych lokalnych do globalej struktury wykorzystywanej do kontroli Safety
	gSafety.diEStop := SafetyLocal.diEStop;
	gSafety.diEStopPanel := SafetyLocal.diEStopPanel;
	gSafety.diGuardDoor1 := SafetyLocal.diGuardDoor1;
	gSafety.diGuardDoor2 := SafetyLocal.diGuardDoor2;
	gSafety.EStop := SafetyLocal.EStop;
	gSafety.EStopPanel := SafetyLocal.EStopPanel;
	gSafety.GuardingDoor := SafetyLocal.GuardingDoor;
	gSafety.SafeChannelOK1 := SafetyLocal.SafeChannelOK1;
	gSafety.SafeChannelOK2 := SafetyLocal.SafeChannelOK2;
	gSafety.doAcoposEnable1 := SafetyLocal.doAcoposEnable1;
	gSafety.doAcoposEnable2 := SafetyLocal.doAcoposEnable2;
	
END_PROGRAM

PROGRAM _EXIT
	 
END_PROGRAM
