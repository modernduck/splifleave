
angular.module("approve.controller", ['sick.model', 'sick.filter'])
	.controller('ApproveIndexCtrl', ["$scope", "$filter", "Query", "LeaveTypes", "$location" , function  ($scope, $filter, Query, LeaveTypes, $location) {
		// body...
		$scope.requests = [];
		$scope.user= {};

		Query.getUser(function(current_user){
			//Query.query("l_approverlist", {"EmplID":current_user.})
			Query.get("l_empltable", {"UserID":current_user.user}, function(user){
				$scope.user = user;
				var obj = {approve_id: $scope.user.EmplID}
				Query.fetchApproveRequests(obj, function (response){
					console.log('=====');
					$scope.leaves = response;
					//$scope.leaves = $filter('filter')($scope.leaves, {Status:Config.STATUS.SENDED})
					$scope.tmp_leave_trans = {};
					for(var i =0; i < $scope.leaves.length; i++)
					{
						$scope.tmp_leave_trans[$scope.leaves[i].LeaveTransID] = i;
						Query.getApproverApproveStatus({LeaveTransID:$scope.leaves[i].LeaveTransID, Approve:user.EmplID}, function  (obj) {
							// body...
							var index = $scope.tmp_leave_trans[obj.LeaveTransID]
							if(!angular.isUndefined($scope.leaves[index]))
							{
								console.log('gonna fix ' + index)
								console.log('Old status ' + $scope.leaves[index].Status)
								$scope.leaves[index].Status = obj.Status
								console.log("new status " + obj.Status);
							}else
							console.log('isUndefined at ' + index)
							
						})
					}
				})
				/*Query.query("l_approverlist", {"Approver1":user.EmplID}, function (list) {
					$scope.requests = list
					Query.query("l_approverlist", {"Approver2":user.EmplID}, function (list2) {
						// body...
						$scope.requests = $scope.requests.concat(list2);
						Query.query("l_approverlist", {"Approver3":user.EmplID}, function (list3) {
							$scope.requests = $scope.requests.concat(list3);
							console.log($scope.requests);
							//get all 
							var obj = {};
							obj.requests = $scope.requests;
							Query.fetchApproveRequests(obj, function (response){
								console.log('=====');
								$scope.leaves = response;
								$scope.leaves = $filter('filter')($scope.leaves, {Status:Config.STATUS.SENDED})
								$scope.tmp_leave_trans = {};
								for(var i =0; i < $scope.leaves.length; i++)
								{
									$scope.tmp_leave_trans[$scope.leaves[i].LeaveTransID] = i;
									Query.getApproverApproveStatus({LeaveTransID:$scope.leaves[i].LeaveTransID, Approve:user.EmplID}, function  (obj) {
										// body...
										var index = $scope.tmp_leave_trans[obj.LeaveTransID]
										if(!angular.isUndefined($scope.leaves[index]))
										{
											console.log('gonna fix ' + index)
											console.log('Old status ' + $scope.leaves[index].Status)
											$scope.leaves[index].Status = obj.Status
											console.log("new status " + obj.Status);
										}else
										console.log('isUndefined at ' + index)
										
									})
								}
							})

						});
					});
				});*/
			});
			
		});
		
		
	}]).controller("LeaveIndexCtrl", ["$scope", "$filter", "Query", "LeaveTypes", "$location" , function  ($scope, $filter, Query, LeaveTypes, $location) {
		Query.getUser(function(current_user){
			Query.get("l_empltable", {"UserID":current_user.user}, function(user){
				$scope.user = user;
				Query.query("l_leavetrans", {"EmplID":user.EmplID}, function (list) {
					$scope.leaves = list;

				});
			});
		});

	}]).controller("CancleIndexCtrl", ["$scope", "$filter", "Query", "LeaveTypes", "$location" , function  ($scope, $filter, Query, LeaveTypes, $location) {
		Query.getUser(function(current_user){
			Query.get("l_empltable", {"UserID":current_user.user}, function(user){
				$scope.user = user;
				Query.query("l_leavetrans", {"EmplID":user.EmplID}, function (list) {
					//$scope.leaves = $filter('filter)'(list);;
					$scope.leaves = list;
					$scope.leaves = $filter('filter')(list, function  (item) {
						// body...
						if(item.Status == 3 || item.Status == 5 || item.Status == 6)
							return true;
					})

				});
			});
		});

	}])

	;
