package com.pearson.assess.cordova;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.FileNotFoundException;

import android.net.Uri;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaResourceApi.OpenForReadResult;
import org.apache.cordova.PluginResult;
import org.json.JSONException;
import org.json.JSONObject;

import org.kamranzafar.jtar.*;

import android.util.Log;


public class Tar extends CordovaPlugin {
    private static final String LOG_TAG = "Tar";

    @Override
    public boolean execute(String action, CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
        if ("untar".equals(action)) {
            untar(args, callbackContext);
            return true;
        }
        return false;
    }

    private void untar(final CordovaArgs args, final CallbackContext callbackContext) {
        this.cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                untarSync(args, callbackContext);
            }
        });
    }

    private void untarSync(CordovaArgs args, CallbackContext callbackContext) {
        InputStream inputStream = null;
        try {
            String tarFileName = args.getString(0);
            String outputDirectory = args.getString(1);

            // Since Cordova 3.3.0 and release of File plugins, files are accessed via cdvfile://
            // Accept a path or a URI for the source zip.
            Uri tarUri = getUriForArg(tarFileName);
            Uri outputUri = getUriForArg(outputDirectory);

            CordovaResourceApi resourceApi = webView.getResourceApi();
            File tempFile = resourceApi.mapUriToFile(tarUri);
            if (tempFile == null || !tempFile.exists()) {
                String errorMessage = "Tar file does not exist";
                callbackContext.error(errorMessage);
                Log.e(LOG_TAG, errorMessage);
                return;
            }

            File outputDir = resourceApi.mapUriToFile(outputUri);
            outputDirectory = outputDir.getAbsolutePath();
            outputDirectory += outputDirectory.endsWith(File.separator) ? "" : File.separator;
            if (outputDir == null || (!outputDir.exists() && !outputDir.mkdirs())){
                String errorMessage = "Could not create output directory";
                callbackContext.error(errorMessage);
                Log.e(LOG_TAG, errorMessage);
                return;
            }
            OpenForReadResult tarFile = resourceApi.openForRead(tarUri);
            inputStream = new BufferedInputStream(tarFile.inputStream);
            TarInputStream tis = new TarInputStream(inputStream);
            TarEntry entry;

            while((entry = tis.getNextEntry()) != null) {
                int count;
                byte data[] = new byte[2048];
                FileOutputStream fos = new FileOutputStream(outputDirectory + "/" + entry.getName());
                BufferedOutputStream dest = new BufferedOutputStream(fos);
            
                while((count = tis.read(data)) != -1) {
                    dest.write(data, 0, count);
                }
            
                dest.flush();
                dest.close();
            }
            
            tis.close();

        } catch (Exception e) {
            String errorMessage = "An error occurred while untarring.";
            callbackContext.error(errorMessage);
            Log.e(LOG_TAG, errorMessage, e);
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                }
            }
        }
    }

}