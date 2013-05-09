/******************************************
 * 多子棋插件
 *
 * @作者 ：听涛设计
 * @版权 ：Copyright (c) 2013 听涛TinTao.
 * @网址 ：http://www.saecn.com
 * @更新 : 2013-05-08
 * @版本 ：Version 0.1.1
 *
 ******************************************/
(function($){
	$.fn.wzGame = function(option, settings){
		if(typeof option === 'object'){
			settings = option;
		}else if(typeof option == 'string'){
			var values = [];

			var elements = this.each(function()
			{
				var data = $(this).data('_wzGame');

				if(data)
				{
					if($.fn.wzGame.defaultSettings[option] !== undefined)
					{
						if(settings !== undefined) { data.settings[option] = settings; }
						else { values.push(data.settings[option]); }
					}
				}
			});

			if(values.length === 1) { return values[0]; }
			if(values.length > 0) { return values; }
			else { return elements; }
		}

		settings = $.extend({}, $.fn.wzGame.defaultSettings, settings || {});

		return this.each(function(){
			var elem = $(this);	
			var $settings = jQuery.extend(true, {}, settings);
			
			var cp = new Game($settings, elem);

			cp.init();

			elem.data('_wzGame', cp);
		});
	};

	$.fn.wzGame.defaultSettings = {
		wzNum          : 5,//设置多少棋子连成串可以赢
		zHang          : 10,//几行
		zLie           : 10,//几列			
	};

	/**
	 * 定义Game类
	 */
	function Game(settings, elem)
	{
		this.settings = settings;
		this.$elem = elem;
		this.flag = true;//标志黑子或者白子
		this.b_QiZi = 0;//已下黑子数
		this.w_QiZi = 0;//已下白子数
		this.times = 0;//等于5 就是胜利
		this.historyStep = '';//每一步都记录在这里
		this.dispalyVal = '黑子方先手';
		this.allQiZi = settings.zHang*settings.zLie;//总共的棋盘格子
		this.tableWidth = settings.zLie*50;//表格宽
		this.tableHeight = settings.zHang*50;//表格高
		return this;
	}

	Game.prototype =
	{
		init:function(){
			var $this = this;
			
			var str = "<table><tr><td>";
			str += "<table align='center' border='1'  bgcolor='#ddddee'><tr><td>";
			str += "<table width='"+$this.tableWidth+"' height='"+$this.tableHeight+"' align='center' border='0' cellspacing='0' cellpadding='0'  bgcolor='#ccccdd'>";
			for(var b= 1;b <= $this.settings.zHang ; b++ ){
					str += "<tr>";
						for(var a= 1; a <= $this.settings.zLie ; a++){
							str += "<td>";
							str += "<div name = div_"+a+"_"+b+"  id = div_"+a+"_"+b+"_b class=td style= 'display:none; width:50px; height:50px' ><img src= image/black_.gif width=50 heigh=50 ></div>\n";
							str += "<div name = div_"+a+"_"+b+"  id = div_"+a+"_"+b+"_w class=td style= 'display:none; width:50px; height:50px' ><img src= image/white_.gif width=50 heigh=50 ></div>\n";
							str += "<div name = div_"+a+"_"+b+"  id = div_"+a+"_"+b+"_n class=td style= 'display:block; width:50px; height:50px' ><img src= image/null_.gif width=50 heigh=50 ></div>\n";
							str += "</td>";
						}
					str += "</tr>";
			};
			str += "</table >";
			str += "</td></tr></table >";
			str += "</td><td valign=top><table border=1 width=300 height='"+$this.tableHeight+"' bgcolor=#FFCC33><tr><td valign=top>";
			str += "<table width=100%  border=0  bgcolor=#FFCC33 ><tr><td width=40% align=center height=40><div style='font-size:20px; line-height:40px; background:#FFdd44' id=displayInfo></div></td></tr></tr><td width=20% align=center height=40><input type=button  value='悔　　棋' id=goback></td></tr></tr><td width=10% align=center height=40><input type=button  value=重新开始 id=reloadGame></td></tr></tr><td width=30% align=center height=40><input type=button  value=退出游戏 id=logout></td></tr></table></td></tr></table>";
			str += "</td></tr></table>"
			$this.$elem.html(str);
			$("#displayInfo").html(this.dispalyVal);
			$this.$elem.find(".td").bind('click',function(){
				var tid = $(this).attr("name");
				if($this.historyStep.indexOf(tid)>-1){//点击过了的棋子不能够再次点击
					return false;
				};
				if($this.flag){
					if($(this).css("display")!="none"){//显示黑子
						$("#"+tid+"_b").css("display","block");
						$("#"+tid+"_w").css("display","none");
						$("#"+tid+"_n").css("display","none");
						$this.historyStep = $this.historyStep +"="+ tid+"_b";
					}else{
						if($("#"+tid+"_w").css("display") != "none" || $("#"+tid+"_b").css("display") != "none"){
							return false;
						}
					}
					$this.b_QiZi++;
					$this.checkWin($this,$("#"+tid+"_b"),"black");//检查黑子是否胜利
					$this.flag = false;
					$("#displayInfo").html("白子方走棋，白子方已走"+$this.w_QiZi+"步");
				}else{
					if($(this).css("display")!="none"){//显示白子
						$("#"+tid+"_w").css("display","block");
						$("#"+tid+"_b").css("display","none");
						$("#"+tid+"_n").css("display","none");
						$this.historyStep = $this.historyStep +"="+ tid+"_w";
					}else{
						if($("#"+tid+"_w").css("display") != "none" || $("#"+tid+"_b").css("display") != "none"){
							return false;
						}
					}
					$this.w_QiZi++;
					$this.checkWin($this,$("#"+tid+"_w"),"white");//检查白子是否胜利
					$this.flag =true;
					$("#displayInfo").html("黑子方走棋，黑子方已走"+$this.b_QiZi+"步");
				}
				if(($this.w_QiZi + $this.b_QiZi)>= $this.allQiZi){
					if(confirm("比赛结束了，双方平局！需要再来一局吗？")){
						window.location.reload();
					};
				}
			});
			/*******************************************
			 *
		     *悔棋
		     *
			 ******************************************/
			$("#goback").click(function(){
				var hisstep = $this.historyStep.split("=");
				if(hisstep.length <= 1){
					alert("不能再悔了");
					return false;
				}
				var laststep = hisstep[hisstep.length-1];
				var last = $("#"+laststep);
				last.css("display","none");
				var b = $this.historyStep.length - last.attr("id").length-1;
				$this.historyStep = $this.historyStep.substring(0,b);
				$($this.dispaly).val(" *黑子方*走棋* ");
				if($this.flag){				
					var lastNull = $("#"+laststep.toString().replace("w","n"));
					lastNull.css("display","block");
					$this.w_QiZi--;
					$($this.dispaly).val(" *白子方*走棋* _已"+$this.w_QiZi+"步");
					$this.flag = false;
				}else{
					var lastNull = $("#"+laststep.toString().replace("b","n"));
					lastNull.css("display","block");
					$this.b_QiZi--;
					$($this.dispaly).val(" *黑子方*走棋* _已"+$this.b_QiZi+"步");
					$this.flag = true;
				}
			});
			/*******************************************
			 *
		     *退出游戏
		     *
			 ******************************************/
			$("#logout").click(function(){
			 	window.close();
			});
			/*******************************************
			 *
		     *重新开始
		     *
			 ******************************************/
			$("#reloadGame").click(function(){
				$this.reGame();
			});
		},

		checkWin:function ($this,divObj,wORb){
				
			if(wORb == "white"){
				if($this.w_QiZi < $this.settings.wzNum){
					return false;
				}else{
					this.checkWhoWin($this,divObj);
				}
			}
			if(wORb == "black"){					
				if($this.b_QiZi < $this.settings.wzNum){
					return false;
				}else{
					this.checkWhoWin($this,divObj);
				}
			}
		},

		checkWhoWin:function ($this,divObj){
			var ss;
			var xLine,yLine;
			var bORw;
			var divname = divObj.attr("id");
			//console.log(divname);
			ss = divname.split("_");
			
			xLine = ss[1];
			yLine = ss[2];
			bORw = ss[3];
			
			this.checkXY($this,xLine,yLine,bORw);
		},
		
		checkXY:function ($this,xLine,yLine,bORw){//检测棋子连贯性并判断输赢
			$this.times = 0;
			var win = false;
			
			if(!win){
				$this.times = this.checkXY_left($this,xLine,yLine,bORw,$this.times);//左，
				win = this.whoWin($this,bORw);
			}
			//console.log($this.times,win);
			if(!win){
				$this.times = this.checkXY_right($this,xLine,yLine,bORw,$this.times);//右
				win = this.whoWin($this,bORw);
			}
			//console.log($this.times,win);
			$this.times = 0;
			if(!win){	
				$this.times = this.checkXY_left_up($this,xLine,yLine,bORw,$this.times);//左上
				win = this.whoWin($this,bORw);
			}
			//console.log($this.times,win);
			if(!win){
				$this.times = this.checkXY_right_down($this,xLine,yLine,bORw,$this.times);//右下
				win = this.whoWin($this,bORw);
			}
			//console.log($this.times,win);
			$this.times = 0;
			if(!win){
				$this.times = this.checkXY_up($this,xLine,yLine,bORw,$this.times);//，上
				win = this.whoWin($this,bORw);
			}
			//console.log($this.times,win,"==1");
			if(!win){
				$this.times = this.checkXY_down($this,xLine,yLine,bORw,$this.times);//下
				win = this.whoWin($this,bORw);
			}
			//console.log($this.times,win,"==2");
			$this.times = 0;
			if(!win){
				$this.times = this.checkXY_right_up($this,xLine,yLine,bORw,$this.times);//右上
				win = this.whoWin($this,bORw);
			}
			//console.log($this.times,win);
			if(!win){
				$this.times = this.checkXY_left_down($this,xLine,yLine,bORw,$this.times);//左下
				win = this.whoWin($this,bORw);
			}
			//console.log($this.times,win);
					
			
		},
		
		checkXY_left:function ($this,xLine,yLine,bORw,count){//检查横向左方向棋子
			xLine = Number(xLine);
			yLine = Number(yLine);
			for(var i = xLine-1;i > 0; i --){
				if($("#div_"+i+"_"+yLine+"_"+bORw).css("display") == "block"){
					count++;
				}else{						
					break;	
				}
			}
			return count;
		},

		checkXY_right:function ($this,xLine,yLine,bORw,count){//检查横向右方向棋子
			xLine = Number(xLine);
			yLine = Number(yLine);
			for(var i = xLine+1;i <= $this.settings.zLie; i ++){
				if($("#div_"+i+"_"+yLine+"_"+bORw).css("display") == "block"){
					count++;
				}else{
					break;
				}
				
			}
			return count;
		},

		checkXY_left_up:function ($this,xLine,yLine,bORw,count){//检查斜向左上方棋子
			xLine = Number(xLine);
			yLine = Number(yLine);
			var j = yLine-1;
			for(var i = xLine-1;i > 0; i --){				
				if(j > 0){
					if($("#div_"+i+"_"+j+"_"+bORw).css("display") == "block"){
						count++;
					}else{						
						break;	
					}
				}
				j--;
			}
			return count;
		},

		checkXY_right_down:function ($this,xLine,yLine,bORw,count){//检查斜向右下方棋子
			xLine = Number(xLine);
			yLine = Number(yLine);
			var j = yLine+1;
			for(var i = xLine+1;i <= $this.settings.zLie; i ++){		
				if(j <= $this.settings.zLie) {
					if($("#div_"+i+"_"+j+"_"+bORw).css("display") == "block"){
						count++;
					}else{						
						break;	
					}
				}
				j ++;
			}
			
			return count;
		},
		
		checkXY_up:function ($this,xLine,yLine,bORw,count){//检查纵向上方棋子
			xLine = Number(xLine);
			yLine = Number(yLine);
			for(var i = yLine-1;i > 0; i --){
				if($("#div_"+xLine+"_"+i+"_"+bORw).css("display") == "block"){
					count++;
				}else{						
					break;	
				}
				
			}
			return count;
		},

		checkXY_down:function ($this,xLine,yLine,bORw,count){//检查纵向下方棋子
			xLine = Number(xLine);
			yLine = Number(yLine);
			for(var i = yLine+1;i <= $this.settings.zHang; i ++){
				if($("#div_"+xLine+"_"+i+"_"+bORw).css("display") == "block"){
					count++;
				}else{						
					break;	
				}
			}
			return count;
		},
		
		checkXY_right_up:function ($this,xLine,yLine,bORw,count){//检查斜向右上方棋子
			xLine = Number(xLine);
			yLine = Number(yLine);
			var j = yLine-1;
			for(var i = xLine+1 ;i <= $this.settings.zLie; i ++){
				if(j > 0 ){
					if($("#div_"+i+"_"+j+"_"+bORw).css("display") == "block"){
						count++;
					}else{						
						break;	
					}
				}
				j--;
			}
			return count;
		},

		checkXY_left_down:function ($this,xLine,yLine,bORw,count){//检查斜向左下方棋子
			xLine = Number(xLine);
			yLine = Number(yLine);
			var j = yLine+1;
			for(var i = xLine-1;i > 0; i --){
				if(j <= $this.settings.zLie){
					if($("#div_"+i+"_"+j+"_"+bORw).css("display") == "block"){
						count++;
					}else{
						break;	
					}
				}
				j ++;
			}
			return count;
		},
		
		whoWin:function ($this,bORw){//判断输赢
			//console.log(times);
			if($this.times >= ($this.settings.wzNum-1)){
				if(bORw == "b"){
					alert("!黑子胜出!")	;
					if(confirm("再来一局吗?")){ 
							window.location.reload();
					}else{
							//window.close();	
					}
				}else{
					alert("!白子胜出!")	;
					if(confirm("再来一局吗?")){ 
							window.location.reload();
					}else{
							//window.close();	
					}
					
				}
				return true;
			}else{
				return false;
			}	
		},
		
		reGame:function (){//重新开始
			if(confirm("重新开始一局吗?")){ 
				window.location.reload();
			}
		}
	}
})(jQuery);