#include "wifiNetwork.hpp"
#include "configuration.h"

#include <WiFi.h> 
#include <HTTPClient.h>

void WifiNetwork::WifiNetwork(void)
{
	connectingNetwork();
	setTime();
}

uint8_t WifiNetwork::getTime(void)
{
	uint8_t returnCode = 1;	
	
	if (getLocalTime(&this->timeInfo) == true)
	{
		returnCode = 0; 
	}
	
	return returnCode;
}

uint8_t WifiNetwork::connectingNetwork(void)
{
	uint8_t returnCode = 1;
	
	WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
	while (WiFi.status() != WL_CONNECTED)
	{
		delay(1000);
	}
	if (WiFi.status() == WL_CONNECTED)
	{
		returnCode = 0;		
	}
	return returnCode;
}

uint8_t WifiNetwork::setTime(void)
{
	uint8_t returnCode = 1;	
	
	configTime(DAY_LIGHT_OFFSET_SEC, GMT_TIMEZONE_SEC, NTP_TIME_SERVER);
	returnCode = getTime();
	
	return returnCode;
}
