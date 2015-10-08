angular.module("leave.controller", ['sick.model', 'sick.filter'])
	.controller('LeaveCtrl', ["$scope", "$filter", "Query", "LeaveTypes", function  ($scope, $filter, Query, LeaveTypes) {
		// body...
		$scope.user;
		$scope.leaves;
		$scope.holidays;
		$scope.leave_types = LeaveTypes.getNormal();
		$scope.selectedType = null;
		$scope.minDate = new Date();
		$scope.minDate.setDate($scope.minDate.getDate() + 1)
		$scope.maxDate = null;
		$scope.type;
		$scope.min_time = new Date();
		$scope.min_time.setHours(8);
		$scope.min_time.setMinutes(0);
		$scope.min_time.setSeconds(0);
		$scope.max_time = new Date();
		$scope.max_time.setHours(17);
		$scope.max_time.setMinutes(0);
		$scope.max_time.setSeconds(0);

		$scope.mytime = angular.copy($scope.min_time)
		$scope.mytime2= angular.copy($scope.max_time)
		$scope.time_used = 0;
		$scope.steps = [false, false, false, false];

		/*
		* Happen when change radio type
		*/
		$scope.updateType = function()
		{
			
			if(LeaveTypes.isSickLeave($scope.selectedType))
			{
				$scope.minDate = $filter('sqlToJsDate')($scope.selectedType.StartDate);
				
				$scope.maxDate = $filter('sqlToJsDate')($scope.selectedType.EndDate);
				$scope.maxDate = $filter('minDate')($scope.maxDate, new Date())
				$scope.maxDate.setDate($scope.maxDate.getDate() - 7);
			}else
			{
				$scope.minDate = new Date();
				$scope.minDate.setDate($scope.minDate.getDate() + 1)
				$scope.minDate = $filter('minDate')($scope.minDate, $filter('sqlToJsDate')($scope.selectedType.StartDate));
				$scope.maxDate = $filter('sqlToJsDate')($scope.selectedType.EndDate);
			}
			$scope.date_time_from = null;
			$scope.date_time_to = null;
			$scope.mytime = angular.copy($scope.min_time)
			$scope.mytime2= angular.copy($scope.max_time)
			$scope.steps = [false, false, false, false];
		}

		/*
		* do this when update 
		*/
		$scope.updateDateTime = function()
		{
			//when update 
			// &&  typeof($scope.date_time_from) != "undefined" && $scope.date_time_from != null && $scope.date_time_from instanceof Date
			//console.log("update date time");
			var checker_items = [$scope.mytime, $scope.date_time_from, $scope.date_time_to, $scope.mytime2];
			var shouldCheckTotal = true;
			for(var i =0; i < checker_items.length; i++)
			{
				//console.log('check no ' + i)
				if( !(typeof(checker_items[i]) != "undefined" && checker_items[i] instanceof Date) )
				{
				//	console.log('break at' + i);
					shouldCheckTotal = false;
					break;
				}
			}
			if(shouldCheckTotal)
			{
				$scope.time_used = $filter('timeDifferent')($scope.date_time_from, $scope.date_time_to, $scope.mytime, $scope.mytime2);
				
				if($filter('isFromMainSite')($scope.user))
				{
					var holiday_list = $filter('filterHolidayListForMainSite')($scope.holidays);
				//	console.log(holiday_list);
					var holiday_usage_days = $filter('timeHoliday')($scope.date_time_from, $scope.date_time_to, holiday_list);
					//var holiday_usage_days = $filter('timeHoliday')($scope.date_time_from, $scope.date_time_to);
				//	console.log('holiday');
				//	console.log(holiday_usage_days	);

					$scope.time_used -= $filter("daysToMins")(holiday_usage_days) ;

				}
				

			}
		}

		Query.get("l_empltable", {"UserID":"wanich"}, function(user){
			$scope.user = user;
			Query.query("l_leavetable", {"EmplID":user.EmplID}, function(leaves){
				$scope.leaves = leaves;
			});
			Query.query("l_holiday", {}, function (holidays){
				console.log(holidays);
				$scope.holidays = holidays;
				
			});
			Query.lastId("l_leavetrans", {"idName":"TransID"}, function (obj){
				$scope.TransID = Number(obj.TransID) + 1;
			})
		});

		$scope.saveForm = function()
		{
			console.log('====== gonna save la =======');
			var obj = {};
			obj.LeaveTransID = $filter('documentId')($scope.TransID);
			obj.EmplID = $scope.user.EmplID;
			obj.LeaveID = $scope.selectedType.LeaveType;
			//if is new version
			obj.CreateDate = $filter('jsDateToSqlDate')(new Date());
			obj.LeaveStartDate = $filter('jsDateToSqlDate')($scope.date_time_from);
			obj.LeaveEndDate = $filter('jsDateToSqlDate')($scope.date_time_to);
			obj.LeaveStartTime = $filter('jsTimeToSqlTime')($scope.mytime);
			obj.LeaveEndTime = $filter('jsTimeToSqlTime')($scope.mytime2)
			obj.Description = $scope.description;
			obj.TotalDay = $filter('leaveDays')($scope.time_used);
			obj.TotalHour = $filter('leaveHours')($scope.time_used);
			obj.TotalMin = $filter('leaveMinutes')($scope.time_used);
			obj.Status = 2;
			console.log(obj);
			Query.create('l_leavetrans', obj, function (data){
				console.log('after create')
				console.log(data)
			})
		/*	console.log($scope.selectedType.LeaveType);
			console.log($filter('jsDateToSqlDate')($scope.date_time_from))
			console.log($filter('jsDateToSqlDate')($scope.date_time_to));
			console.log($filter('jsTimeToSqlTime')($scope.mytime))
			console.log($filter('jsTimeToSqlTime')($scope.mytime2))
			console.log($filter('leaveDays')($scope.time_used) + " days");
			console.log($filter('leaveHours')($scope.time_used) + " hrs");
			console.log($filter('leaveMinutes')($scope.time_used) + " mins");
			console.log($scope.description)*/
		}
		
	}])