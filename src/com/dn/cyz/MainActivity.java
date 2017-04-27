package com.dn.cyz;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.graphics.Color;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.os.IBinder;
import android.os.RemoteException;
import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import woyou.aidlservice.jiuiv5.ICallback;
import woyou.aidlservice.jiuiv5.IWoyouService;

public class MainActivity extends Activity {

	WebView mWebView;
	MediaPlayer media;
	int soundCount = SOUND_COUNT;
	static int SOUND_COUNT = 3;
	@SuppressLint("SetJavaScriptEnabled")
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		initViews();
		initAudio();
		mWebView.getSettings().setDefaultTextEncodingName("utf-8");
		mWebView.getSettings().setJavaScriptEnabled(true);
		mWebView.getSettings().setDomStorageEnabled(true);
		mWebView.setWebChromeClient(new WebChromeClient());
		mWebView.setBackgroundColor(Color.rgb(96, 96, 96));
		mWebView.setWebViewClient(new WebViewClientDemo());
		mWebView.loadData("", "text/html", null);
//		mWebView.loadUrl("http://180.76.134.65:8090/merchant-system/login.html");
		mWebView.addJavascriptInterface(new JsObject(), "cyz");
		mWebView.loadUrl("file:///android_asset/login.html");

		Intent intent = new Intent();
		intent.setPackage("woyou.aidlservice.jiuiv5");
		intent.setAction("woyou.aidlservice.jiuiv5.IWoyouService");
		startService(intent);
		bindService(intent, connService, Context.BIND_AUTO_CREATE);
	}
	private void initAudio() {
		media = MediaPlayer.create(MainActivity.this,R.raw.ring);
		media.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {   
		            @Override   
		           public void onCompletion(MediaPlayer arg0)   
		           {   
		             try   
		             {
	                     if(0!=soundCount)  
	                     {  
	                    	 media.start();  
	                         soundCount--;  
	                     }else{
	                    	 soundCount=SOUND_COUNT;
	                     }
		             }   
		             catch (Exception e)   
		             {   
		               e.printStackTrace();   
		             }   
		           }   
		         });
	}
	class WebViewClientDemo extends WebViewClient {

		@Override
		public boolean shouldOverrideUrlLoading(WebView view, String url) {
			view.loadUrl(url);
			return true;
		}

		@Override
		public void onPageFinished(WebView view, String url) {
			super.onPageFinished(view, url);
		}

	}

	class JsObject {
		static final String FONT_STYLE = "Microsoft Yahei";
		static final int TITLE_FONT_SIZE = 30;
		static final int NORMAL_FONT_SIZE = 24;
		@JavascriptInterface
		public void audioPlay(){
			media.seekTo(0);
			media.start();
		}
		@JavascriptInterface
		public void audioStop(){
			media.pause();
		}
		
		@JavascriptInterface
		public void queryOrderPrint(String orderStr) {
			try {
				Map<String,Object> order = getMapForJson(orderStr);
				Toast.makeText(MainActivity.this.getApplicationContext(), "订单["+order.get("orderNo")+"]小票打印完成", 2000).show();
				System.out.println(orderStr);
				// Map<String,Object> order = getMapForJson(orderStr);
				JSONObject orderJo = new JSONObject(orderStr);
//				Toast.makeText(MainActivity.this.getApplicationContext(),
//						"订单[" + orderJo.getString("orderNo") + "]小票打印完成", 2000).show();
				// woyouService.printerSelfChecking(callback);
				woyouService.enterPrinterBuffer(true);
				woyouService.setAlignment(1, callback);
				woyouService.printTextWithFont("********餐予者********", FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				if(orderJo.has("merchantName"))
				woyouService.printTextWithFont(orderJo.getString("merchantName"), FONT_STYLE, TITLE_FONT_SIZE, callback);
				woyouService.lineWrap(1, callback);
				woyouService.setAlignment(0, callback);
				if(orderJo.has("orderTime"))
				woyouService.printTextWithFont("下单时间：" + orderJo.getString("orderTime"), FONT_STYLE, NORMAL_FONT_SIZE,
						callback);
				woyouService.lineWrap(1, callback);
				// woyouService.setAlignment(0, callback);
				woyouService.printTextWithFont("--------------------------------", FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(1, callback);
				// woyouService.printTextWithFont("订单号："+order.get("orderNo"),FONT_STYLE,
				// NORMAL_FONT_SIZE, callback);
				// woyouService.lineWrap(1, callback);

				JSONArray dishesJa = orderJo.getJSONArray("dishes");
				if (dishesJa != null) {
					for (int i = 0; i < dishesJa.length(); i++) {
						JSONObject dishJo = dishesJa.getJSONObject(i);
						woyouService.printTextWithFont(dishJo.getString("dishName") + "\t\t\t\t\t\t"
								+ dishJo.getString("count") + "\t\t\t\t\t" + dishJo.getString("price2"), FONT_STYLE,
								NORMAL_FONT_SIZE, callback);
						woyouService.lineWrap(1, callback);
					}
				}
				
				woyouService.printTextWithFont("---------其他费用---------------", FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				if(orderJo.has("boxPrice"))
				woyouService.printTextWithFont("餐盒\t\t\t\t\t\t1\t\t\t\t\t" + orderJo.getString("boxPrice"), FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				woyouService.printTextWithFont("--------------------------------", FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				if(orderJo.has("distributionPrice") && !orderJo.isNull("distributionPrice") && !"".equals(orderJo.getString("distributionPrice"))) {
					woyouService.printTextWithFont("配送费\t\t\t\t\t\t" + orderJo.getString("distributionPrice"), FONT_STYLE, NORMAL_FONT_SIZE, callback);
					woyouService.printTextWithFont("--------------------------------", FONT_STYLE, NORMAL_FONT_SIZE, callback);
					woyouService.lineWrap(2, callback);// 换行 2代表换2行
				}
				
				if(orderJo.has("orderPrice"))
				woyouService.printTextWithFont("已付\t\t\t\t\t\t￥" + orderJo.getString("orderPrice"), FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				woyouService.printTextWithFont("--------------------------------", FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				if(orderJo.has("consigneeAddress"))
				woyouService.printTextWithFont(orderJo.getString("consigneeAddress"), FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				if(orderJo.has("userName"))
				woyouService.printTextWithFont(orderJo.getString("userName"), FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				if(orderJo.has("phone"))
				woyouService.printTextWithFont(orderJo.getString("phone"), FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				woyouService.setAlignment(1, callback);
				woyouService.printTextWithFont("**********完********", FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(4, callback);
				woyouService.commitPrinterBuffer();
				
			} catch (RemoteException e) {
				e.printStackTrace();
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} 
		}
		@JavascriptInterface
		public void funAndroid(String orderStr) {

			try {
				Map<String,Object> order = getMapForJson(orderStr);
				Toast.makeText(MainActivity.this.getApplicationContext(), "订单["+order.get("orderNo")+"]小票打印完成", 2000).show();
				System.out.println(orderStr);
				// Map<String,Object> order = getMapForJson(orderStr);
				JSONObject orderJo = new JSONObject(orderStr);
//				Toast.makeText(MainActivity.this.getApplicationContext(),
//						"订单[" + orderJo.getString("orderNo") + "]小票打印完成", 2000).show();
				// woyouService.printerSelfChecking(callback);
				woyouService.enterPrinterBuffer(true);
				woyouService.setAlignment(1, callback);
				woyouService.printTextWithFont("*****#"+orderJo.getString("orderNum")+"餐予者********", FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				if(orderJo.has("merchantName"))
				woyouService.printTextWithFont(orderJo.getString("merchantName"), FONT_STYLE, TITLE_FONT_SIZE, callback);
				woyouService.lineWrap(1, callback);
				woyouService.setAlignment(0, callback);
				if(orderJo.has("orderTime"))
				woyouService.printTextWithFont("下单时间：" + orderJo.getString("orderTime"), FONT_STYLE, NORMAL_FONT_SIZE,
						callback);
				woyouService.lineWrap(1, callback);
				// woyouService.setAlignment(0, callback);
				woyouService.printTextWithFont("--------------------------------", FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(1, callback);
				// woyouService.printTextWithFont("订单号："+order.get("orderNo"),FONT_STYLE,
				// NORMAL_FONT_SIZE, callback);
				// woyouService.lineWrap(1, callback);

				JSONArray dishesJa = orderJo.getJSONArray("dishes");
				if (dishesJa != null) {
					for (int i = 0; i < dishesJa.length(); i++) {
						JSONObject dishJo = dishesJa.getJSONObject(i);
						woyouService.printTextWithFont(dishJo.getString("dishName") + "\t\t\t\t\t\t"
								+ dishJo.getString("count") + "\t\t\t\t\t" + dishJo.getString("price2"), FONT_STYLE,
								NORMAL_FONT_SIZE, callback);
						woyouService.lineWrap(1, callback);
					}
				}
				
				woyouService.printTextWithFont("---------其他费用---------------", FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				if(orderJo.has("boxPrice"))
				woyouService.printTextWithFont("餐盒\t\t\t\t\t\t1\t\t\t\t\t" + orderJo.getString("boxPrice"), FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				woyouService.printTextWithFont("--------------------------------", FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				if(orderJo.has("distributionPrice") && !orderJo.isNull("distributionPrice") && !"".equals(orderJo.getString("distributionPrice"))) {
					woyouService.printTextWithFont("配送费\t\t\t\t\t\t" + orderJo.getString("distributionPrice"), FONT_STYLE, NORMAL_FONT_SIZE, callback);
					woyouService.printTextWithFont("--------------------------------", FONT_STYLE, NORMAL_FONT_SIZE, callback);
					woyouService.lineWrap(2, callback);// 换行 2代表换2行
				}
				
				if(orderJo.has("orderPrice"))
				woyouService.printTextWithFont("已付\t\t\t\t\t\t￥" + orderJo.getString("orderPrice"), FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				woyouService.printTextWithFont("--------------------------------", FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				if(orderJo.has("consigneeAddress"))
				woyouService.printTextWithFont(orderJo.getString("consigneeAddress"), FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				if(orderJo.has("userName"))
				woyouService.printTextWithFont(orderJo.getString("userName"), FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				if(orderJo.has("phone"))
				woyouService.printTextWithFont(orderJo.getString("phone"), FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(2, callback);// 换行 2代表换2行
				woyouService.setAlignment(1, callback);
				woyouService.printTextWithFont("********#"+orderJo.getString("orderNum")+"完********", FONT_STYLE, NORMAL_FONT_SIZE, callback);
				woyouService.lineWrap(4, callback);
				woyouService.commitPrinterBuffer();
				
//				Map<String,Object> order = getMapForJson(orderStr);
//				Toast.makeText(MainActivity.this.getApplicationContext(), "订单["+order.get("orderNo")+"]小票打印完成", 2000).show();
////				woyouService.printerSelfChecking(callback);
//				woyouService.enterPrinterBuffer(true);
//				woyouService.setAlignment(1, callback);
//				woyouService.printTextWithFont("---------餐予者---------", FONT_STYLE, NORMAL_FONT_SIZE, callback);
//				woyouService.lineWrap(2, callback);//换行 2代表换2行
//				woyouService.printTextWithFont("浏半仙贺龙店", FONT_STYLE, TITLE_FONT_SIZE, callback);
//				woyouService.lineWrap(1, callback);
//				woyouService.setAlignment(0, callback);
//				woyouService.printTextWithFont("订单号："+order.get("orderNo"),FONT_STYLE, NORMAL_FONT_SIZE, callback);
//				woyouService.lineWrap(1, callback);
//				woyouService.printTextWithFont("辣椒炒肉\t\t\t\t\t15元",FONT_STYLE, NORMAL_FONT_SIZE, callback);
//				woyouService.lineWrap(1, callback);
//				woyouService.printTextWithFont("雪碧\t\t\t\t\t4元",FONT_STYLE, NORMAL_FONT_SIZE, callback);
//				woyouService.lineWrap(1, callback);
//				woyouService.printTextWithFont("餐盒费\t\t\t\t\t5元",FONT_STYLE, NORMAL_FONT_SIZE, callback);
//				woyouService.lineWrap(2, callback);
//				woyouService.printTextWithFont("合计\t\t\t\t\t24元",FONT_STYLE, NORMAL_FONT_SIZE, callback);
//				woyouService.lineWrap(2, callback);
//				woyouService.setAlignment(1, callback);
//				Bitmap bitmap = BitmapFactory.decodeResource(MainActivity.this.getApplicationContext().getResources(), R.drawable.ic_launcher);
//				woyouService.printBitmap(bitmap, callback);
//				woyouService.lineWrap(1, callback);
//				woyouService.printTextWithFont("餐予者\t为外卖而生", FONT_STYLE, NORMAL_FONT_SIZE, callback);
//				woyouService.lineWrap(4, callback);
//				woyouService.commitPrinterBuffer();
			} catch (RemoteException e) {
				e.printStackTrace();
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} 
		}

		/**
		 * Json 转成 Map<>
		 * 
		 * @param jsonStr
		 * @return
		 */
		public Map<String, Object> getMapForJson(String jsonStr) {
			JSONObject jsonObject;
			try {
				jsonObject = new JSONObject(jsonStr);

				Iterator<String> keyIter = jsonObject.keys();
				String key;
				Object value;
				Map<String, Object> valueMap = new HashMap<String, Object>();
				while (keyIter.hasNext()) {
					key = keyIter.next();
					value = jsonObject.get(key);
					valueMap.put(key, value);
				}
				return valueMap;
			} catch (Exception e) {
				e.printStackTrace();
			}
			return null;
		}
	}

	public void initViews() {
		mWebView = (WebView) findViewById(R.id.wv_view);
	}

	private IWoyouService woyouService;

	private ServiceConnection connService = new ServiceConnection() {

		@Override
		public void onServiceDisconnected(ComponentName name) {
			woyouService = null;
		}

		@Override
		public void onServiceConnected(ComponentName name, IBinder service) {
			woyouService = IWoyouService.Stub.asInterface(service);
		}
	};

	ICallback callback = new ICallback.Stub() {

		@Override
		public void onRunResult(boolean success) throws RemoteException {
		}

		@Override
		public void onReturnString(final String value) throws RemoteException {
		}

		@Override
		public void onRaiseException(int code, final String msg) throws RemoteException {
		}
	};
	private long firstTime = 0;
	@Override  
	public boolean onKeyUp(int keyCode, KeyEvent event) {  
	       // TODO Auto-generated method stub  
	       switch(keyCode)  
	       {  
	       case KeyEvent.KEYCODE_BACK:  
	            long secondTime = System.currentTimeMillis();   
	             if (secondTime - firstTime > 2000) {                                         //如果两次按键时间间隔大于2秒，则不退出  
	                 Toast.makeText(this, "再按一次退出程序", Toast.LENGTH_SHORT).show();   
	                 firstTime = secondTime;//更新firstTime  
	                 return true;   
	             } else {                                                    //两次按键小于2秒时，退出应用  
	            System.exit(0);  
	             }   
	           break;  
	       }  
	     return super.onKeyUp(keyCode, event);  
	}
}
