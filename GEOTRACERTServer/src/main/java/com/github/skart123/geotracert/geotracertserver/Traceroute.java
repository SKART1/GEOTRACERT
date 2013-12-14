/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.github.skart123.geotracert.geotracertserver;

/**
 *
 * @authors
 * Goko
 * dm-kiselev
 */
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.commons.lang.SystemUtils;

/**
 * Класс который отвечает за команду traceroute
 */
public class Traceroute {

	/*
	 * runtime.
	 */
	private Runtime run;
	private int OSType;

	/**
	 * Иницилизация runtime для того команды работали
	 */
	public Traceroute() throws Exception {
		if (SystemUtils.IS_OS_WINDOWS == true)////для Windows tracert
		{
			OSType = 0;
		} else if (SystemUtils.IS_OS_UNIX == true)//для linux
		{
			OSType = 1;
		} else {
			OSType = 3;
			throw new Exception("Unknown operating system");
		}
		run = Runtime.getRuntime();
	}

	/**
	 * Вызов команду traceroute, и возврашает хопы в виде list->
	 * TracerouteItems.
	 *
	 * @param destination пункт назначения hostname или IP
	 * @return list of TracerouteItems
	 */
	public ArrayList<TracerouteItem> traceroute(String destination) {
		/*
		 * Это будет наш результат.
		 */
		ArrayList<TracerouteItem> result = new ArrayList<TracerouteItem>();
		boolean firstLineFlag = true;
		/*
		 * Процесс для вызов команды.
		 */
		Process pr = null;

		/*
		 * Выбор команды для конкрктной ОС. 
		 */
		String cmd = getTracerouteCommand(destination);

		try {
			pr = run.exec(cmd);
		} catch (IOException e) {
			/*
			 * Если что-то не так пойдет...
			 */
			e.printStackTrace();
		}

		/*
		 * Заготовка BufferedReader для четения вывод из traceroute.
		 */
		BufferedReader buf = new BufferedReader(new InputStreamReader(
				pr.getInputStream()));

		/*
		 * Попытка разобрать каждую строку и создать соответствующий TracerouteItem
		 */
		String line = "";
		try {
			while ((line = buf.readLine()) != null) {
//				line = new String(buf.readLine().getBytes(), Charset.forName("CP866"));
//                if (line.length() > 37) {                  
//                   if (firstLineFlag || "Tra".equals(line.substring(0, 3)) || "ove".equals(line.substring(0, 3)) || "Reque".equals(line.substring(32, 37))) 
//                    {
//                       firstLineFlag=false;
//                    } 
//                    else {
//                        firstLineFlag=false;
//                        if (OSType==0) //if windows
//                        {                           
//                            TracerouteItem item = parse(line);
//                            result.add(item);
//                        }
//                        else 
//                        {
//                            TracerouteItem item = parse(line);
//                            result.add(item);
//                        }   
//                    }
//                }
				TracerouteItem item = parse(line);
				result.add(item);
			}
		} catch (IOException e) {
			/*
			 * А вдруг тут что-то не так :)
			 */
			return null;
		}

		/*
		 * Конец метода.
		 */
		return result;
	}

	/**
	 * Извлекает необходимую информацию из строки вывода (один хоп) из
	 *          * Traceroute и делает TracerouteItem от него.
	 *
	 * @param line один хоп из traceroute
	 * @return the правильное TracerouteItem
	 */
	public TracerouteItem parse(String line) {
//		System.out.println("line = " + line);
		String hostname = null, IP = null;
		Pattern hopPattern = Pattern.compile("^[ \t]*[0-9]+");
		Matcher matcher = hopPattern.matcher(line);
		if (matcher.find()) {
			Pattern hostnamePattern = Pattern.compile("[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,6}"),
					IPPattern = Pattern.compile("\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b");
			matcher = hostnamePattern.matcher(line);
			if (matcher.find()) {
				hostname = matcher.group();
			}
			matcher = IPPattern.matcher(line);
			if (matcher.find()) {
				IP = matcher.group();
			}
		}
//		System.out.println("hostname = " + hostname + "; IP = " + IP);
		return new TracerouteItem(hostname, IP);
	}

	/**
	 * Получает надлежащую команду запустить трассировку для этой операционной
	 * системы.
	 *
	 * @param destination пункт назначения hostname или IP
	 * @return правильная traceroute команда
	 */
	public String getTracerouteCommand(String destination) {
		String cmd = "";
		if (OSType == 0)////для Windows tracert
		{
			cmd = ("tracert " + destination);
		} else if (OSType == 1)//для linux
		{
			cmd = ("traceroute " + destination);
		};
		return cmd;
	}
}
