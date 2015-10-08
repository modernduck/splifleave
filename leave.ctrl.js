angular.module("leave.controller", ['sick.model', 'sick.filter'])
	.controller('LeaveCtrl', ["$scope", "$filter", "Query", "LeaveTypes", function  ($scope, $filter, Query, LeaveTypes) {
		// body...
		$scope.user;
		$scope.leaves;
		$scope.leave_types = LeaveTypes.getNormal();
		$scope.selectedType = null;
		$scope.minDate = new Date();
		$scope.minDate.setDate($scope.minDate.getDate() + 1)
		$scope.maxDate = null;
		$scope.type;
		$scope.min_time = new Date();
		$scope.min_time.setHours(8);
		$scope.min_time.setMinutes(0);
		$scope.max_time = new Date();
		$scope.max_time.setHours(17);
		$scope.max_time.setMinutes(0);

		$scope.mytime = angular.copy($scope.min_time)
		$scope.mytime2= angular.copy($scope.max_time)
		$scope.time_used = 0;
		

		/*
		* Happen when change radio type
		*/
		$scope.updateType = function()
		{
			console.log('update na')
			console.log($scope.selectedType)
			console.log(LeaveTypes.isSickLeave($scope.selectedType) )
			
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
		
		}

		/*
		* do this when update 
		*/
		$scope.updateDateTime = function()
		{
			//when update 
			// &&  typeof($scope.date_time_from) != "undefined" && $scope.date_time_from != null && $scope.date_time_from instanceof Date
			console.log("update date time");
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
			}
		}

		Query.get("l_empltable", {"UserID":"wanich"}, function(user){
			$scope.user = user;
			Query.query("l_leavetable", {"EmplID":user.EmplID}, function(leaves){
				$scope.leaves = leaves;
			})
		});
		$scope.test = "yo";
	}])