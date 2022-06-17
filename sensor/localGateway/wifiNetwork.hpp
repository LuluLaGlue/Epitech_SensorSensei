#ifndef WIFINETWORK_HPP
#define WIFINETWORK_HPP

#include <stdint.h>
#include "time.h"

class WifiNetwork
{
public:
	struct tm timeInfo;
	
	void WifiNetwork(void);
	uint8_t getTime(void);
	
private:	
	uint8_t connectingNetwork(void);
	uint8_t setTime(void);
};

#endif // WIFINETWORK_HPP
