#!/bin/bash
kubectl -n gridvo get svc | grep -q gridvo-mosca
if [ "$?" == "1" ];then
	kubectl create -f gridvo_mosca-service.yaml --record
	kubectl -n gridvo get svc | grep -q gridvo-mosca
	if [ "$?" == "0" ];then
		echo "gridvo_mosca-service install success!"
	else
		echo "gridvo_mosca-service install fail!"
	fi
else
	echo "gridvo_mosca-service is exist!"
fi
kubectl -n gridvo get pods | grep -q gridvo-mosca
if [ "$?" == "1" ];then
	kubectl create -f gridvo_mosca-deployment.yaml --record
	kubectl -n gridvo get pods | grep -q gridvo-mosca
	if [ "$?" == "0" ];then
		echo "gridvo_mosca-deployment install success!"
	else
		echo "gridvo_mosca-deployment install fail!"
	fi
else
	kubectl delete -f gridvo_mosca-deployment.yaml
	kubectl -n gridvo get pods | grep -q gridvo-mosca
	while [ "$?" == "0" ]
	do
	kubectl -n gridvo get pods | grep -q gridvo-mosca
	done
	kubectl create -f gridvo_mosca-deployment.yaml --record
	kubectl -n gridvo get pods | grep -q gridvo-mosca
	if [ "$?" == "0" ];then
		echo "gridvo_mosca-deployment update success!"
	else
		echo "gridvo_mosca-deployment update fail!"
	fi
fi
