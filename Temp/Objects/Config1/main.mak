SHELL := cmd.exe
CYGWIN=nontsec
export PATH := C:\WINDOWS\system32;C:\WINDOWS;C:\WINDOWS\System32\Wbem;C:\WINDOWS\System32\WindowsPowerShell\v1.0\;C:\Users\Szkolenie\AppData\Local\Microsoft\WindowsApps;C:\Program Files (x86)\Common Files\Hilscher GmbH\TLRDecode;C:\Users\Szkolenie\AppData\Local\GitHubDesktop\bin;C:\Users\Szkolenie\AppData\Local\Microsoft\WindowsApps;C:\Program Files (x86)\Common Files\Hilscher GmbH\TLRDecode;C:\Users\Szkolenie\AppData\Local\GitHubDesktop\bin;C:\BRAutomation\AS411\bin-en\4.11;C:\BRAutomation\AS411\bin-en\4.10;C:\BRAutomation\AS411\bin-en\4.9;C:\BRAutomation\AS411\bin-en\4.8;C:\BRAutomation\AS411\bin-en\4.7;C:\BRAutomation\AS411\bin-en\4.6;C:\BRAutomation\AS411\bin-en\4.5;C:\BRAutomation\AS411\bin-en\4.4;C:\BRAutomation\AS411\bin-en\4.3;C:\BRAutomation\AS411\bin-en\4.2;C:\BRAutomation\AS411\bin-en\4.1;C:\BRAutomation\AS411\bin-en\4.0;C:\BRAutomation\AS411\bin-en
export AS_BUILD_MODE := BuildAndTransfer
export AS_VERSION := 4.11.3.51 SP
export AS_WORKINGVERSION := 4.11
export AS_COMPANY_NAME := B&R Industrial Automation GmbH
export AS_USER_NAME := Szkolenie
export AS_PATH := C:/BRAutomation/AS411
export AS_BIN_PATH := C:/BRAutomation/AS411/bin-en
export AS_PROJECT_PATH := C:/Users/Szkolenie/Documents/GitHub/Robot-Comau
export AS_PROJECT_NAME := RobotComau
export AS_SYSTEM_PATH := C:/BRAutomation/AS/System
export AS_VC_PATH := C:/BRAutomation/AS411/AS/VC
export AS_TEMP_PATH := C:/Users/Szkolenie/Documents/GitHub/Robot-Comau/Temp
export AS_CONFIGURATION := Config1
export AS_BINARIES_PATH := C:/Users/Szkolenie/Documents/GitHub/Robot-Comau/Binaries
export AS_GNU_INST_PATH := C:/BRAutomation/AS411/AS/GnuInst/V4.1.2
export AS_GNU_BIN_PATH := C:/BRAutomation/AS411/AS/GnuInst/V4.1.2/4.9/bin
export AS_GNU_INST_PATH_SUB_MAKE := C:/BRAutomation/AS411/AS/GnuInst/V4.1.2
export AS_GNU_BIN_PATH_SUB_MAKE := C:/BRAutomation/AS411/AS/GnuInst/V4.1.2/4.9/bin
export AS_INSTALL_PATH := C:/BRAutomation/AS411
export WIN32_AS_PATH := "C:\BRAutomation\AS411"
export WIN32_AS_BIN_PATH := "C:\BRAutomation\AS411\bin-en"
export WIN32_AS_PROJECT_PATH := "C:\Users\Szkolenie\Documents\GitHub\Robot-Comau"
export WIN32_AS_SYSTEM_PATH := "C:\BRAutomation\AS\System"
export WIN32_AS_VC_PATH := "C:\BRAutomation\AS411\AS\VC"
export WIN32_AS_TEMP_PATH := "C:\Users\Szkolenie\Documents\GitHub\Robot-Comau\Temp"
export WIN32_AS_BINARIES_PATH := "C:\Users\Szkolenie\Documents\GitHub\Robot-Comau\Binaries"
export WIN32_AS_GNU_INST_PATH := "C:\BRAutomation\AS411\AS\GnuInst\V4.1.2"
export WIN32_AS_GNU_BIN_PATH := "C:\BRAutomation\AS411\AS\GnuInst\V4.1.2\bin"
export WIN32_AS_INSTALL_PATH := "C:\BRAutomation\AS411"

.suffixes:

ProjectMakeFile:

	@'$(AS_BIN_PATH)/4.9/BR.AS.AnalyseProject.exe' '$(AS_PROJECT_PATH)/RobotComau.apj' -t '$(AS_TEMP_PATH)' -c '$(AS_CONFIGURATION)' -o '$(AS_BINARIES_PATH)'   -sfas -buildMode 'BuildAndTransfer'   

