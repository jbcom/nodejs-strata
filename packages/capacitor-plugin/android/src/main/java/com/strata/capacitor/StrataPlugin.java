package com.strata.capacitor;

import android.content.Context;
import android.content.res.Configuration;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Display;
import android.view.InputDevice;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.view.WindowMetrics;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CapacitorPlugin(name = "Strata")
public class StrataPlugin extends Plugin {

    private Map<String, List<String>> inputMapping = new HashMap<>();
    private Map<Integer, JSObject> activeTouches = new HashMap<>();
    private Vibrator vibrator;
    
    // Gamepad state storage
    private Map<Integer, float[]> gamepadAxes = new HashMap<>();
    private Map<Integer, Map<Integer, Boolean>> gamepadButtons = new HashMap<>();

    @Override
    public void load() {
        super.load();
        
        inputMapping.put("moveForward", createStringList("KeyW", "ArrowUp"));
        inputMapping.put("moveBackward", createStringList("KeyS", "ArrowDown"));
        inputMapping.put("moveLeft", createStringList("KeyA", "ArrowLeft"));
        inputMapping.put("moveRight", createStringList("KeyD", "ArrowRight"));
        inputMapping.put("jump", createStringList("Space"));
        inputMapping.put("action", createStringList("KeyE", "Enter"));
        inputMapping.put("cancel", createStringList("Escape"));

        initVibrator();
    }

    private List<String> createStringList(String... items) {
        List<String> list = new ArrayList<>();
        for (String item : items) {
            list.add(item);
        }
        return list;
    }

    private void initVibrator() {
        Context context = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vibratorManager = (VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            if (vibratorManager != null) {
                vibrator = vibratorManager.getDefaultVibrator();
            }
        } else {
            vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        }
    }

    private String detectDeviceType() {
        Context context = getContext();
        Configuration config = context.getResources().getConfiguration();
        int screenLayout = config.screenLayout & Configuration.SCREENLAYOUT_SIZE_MASK;
        
        boolean isTablet = screenLayout >= Configuration.SCREENLAYOUT_SIZE_LARGE;
        
        if (isFoldableDevice()) {
            return "foldable";
        } else if (isTablet) {
            return "tablet";
        } else {
            return "mobile";
        }
    }

    private boolean isFoldableDevice() {
        String manufacturer = Build.MANUFACTURER.toLowerCase();
        String model = Build.MODEL.toLowerCase();
        
        if (manufacturer.contains("samsung") && (model.contains("fold") || model.contains("flip"))) {
            return true;
        }
        if (manufacturer.contains("huawei") && model.contains("mate x")) {
            return true;
        }
        if (manufacturer.contains("motorola") && model.contains("razr")) {
            return true;
        }
        return false;
    }

    private String detectInputMode() {
        boolean hasGamepad = hasGameController();
        boolean hasTouch = hasTouchScreen();
        
        if (hasGamepad && hasTouch) {
            return "hybrid";
        } else if (hasGamepad) {
            return "gamepad";
        } else if (hasTouch) {
            return "touch";
        }
        return "keyboard";
    }

    private boolean hasGameController() {
        int[] deviceIds = InputDevice.getDeviceIds();
        for (int deviceId : deviceIds) {
            InputDevice device = InputDevice.getDevice(deviceId);
            if (device != null) {
                int sources = device.getSources();
                if ((sources & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD ||
                    (sources & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean hasTouchScreen() {
        return getContext().getPackageManager().hasSystemFeature("android.hardware.touchscreen");
    }
    
    /**
     * Handle gamepad motion events to track axis and button states.
     * This should be called from the activity's onGenericMotionEvent and onKeyDown/onKeyUp.
     * For now, we'll poll InputDevice state in getInputSnapshot.
     */
    private void updateGamepadState(MotionEvent event) {
        if ((event.getSource() & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK) {
            int deviceId = event.getDeviceId();
            InputDevice device = InputDevice.getDevice(deviceId);
            if (device != null) {
                // Read joystick axes
                float[] axes = new float[6];
                axes[0] = event.getAxisValue(MotionEvent.AXIS_X);
                axes[1] = event.getAxisValue(MotionEvent.AXIS_Y);
                axes[2] = event.getAxisValue(MotionEvent.AXIS_Z);
                axes[3] = event.getAxisValue(MotionEvent.AXIS_RZ);
                axes[4] = event.getAxisValue(MotionEvent.AXIS_LTRIGGER);
                axes[5] = event.getAxisValue(MotionEvent.AXIS_RTRIGGER);
                gamepadAxes.put(deviceId, axes);
            }
        }
    }

    private String getOrientation() {
        Configuration config = getContext().getResources().getConfiguration();
        if (config.orientation == Configuration.ORIENTATION_LANDSCAPE) {
            return "landscape";
        }
        return "portrait";
    }

    private JSObject getSafeAreaInsets() {
        JSObject insets = new JSObject();
        insets.put("top", 0);
        insets.put("right", 0);
        insets.put("bottom", 0);
        insets.put("left", 0);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                View rootView = getActivity().getWindow().getDecorView();
                WindowInsets windowInsets = rootView.getRootWindowInsets();
                if (windowInsets != null) {
                    android.graphics.Insets systemInsets = windowInsets.getInsets(
                        WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout()
                    );
                    float density = getContext().getResources().getDisplayMetrics().density;
                    insets.put("top", systemInsets.top / density);
                    insets.put("right", systemInsets.right / density);
                    insets.put("bottom", systemInsets.bottom / density);
                    insets.put("left", systemInsets.left / density);
                }
            } catch (Exception e) {
                Log.w("StrataPlugin", "Failed to get system bar insets", e);
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            try {
                View rootView = getActivity().getWindow().getDecorView();
                WindowInsets windowInsets = rootView.getRootWindowInsets();
                if (windowInsets != null) {
                    android.view.DisplayCutout cutout = windowInsets.getDisplayCutout();
                    if (cutout != null) {
                        float density = getContext().getResources().getDisplayMetrics().density;
                        insets.put("top", cutout.getSafeInsetTop() / density);
                        insets.put("right", cutout.getSafeInsetRight() / density);
                        insets.put("bottom", cutout.getSafeInsetBottom() / density);
                        insets.put("left", cutout.getSafeInsetLeft() / density);
                    }
                }
            } catch (Exception e) {
                Log.w("StrataPlugin", "Failed to get display cutout insets", e);
            }
        }

        return insets;
    }

    private JSObject buildDeviceProfile() {
        JSObject profile = new JSObject();
        
        String deviceType = detectDeviceType();
        String inputMode = detectInputMode();
        DisplayMetrics metrics = getContext().getResources().getDisplayMetrics();
        
        profile.put("deviceType", deviceType);
        profile.put("platform", "android");
        profile.put("inputMode", inputMode);
        profile.put("orientation", getOrientation());
        profile.put("hasTouch", hasTouchScreen());
        profile.put("hasPointer", false);
        profile.put("hasGamepad", hasGameController());
        profile.put("isMobile", deviceType.equals("mobile"));
        profile.put("isTablet", deviceType.equals("tablet"));
        profile.put("isFoldable", deviceType.equals("foldable"));
        profile.put("isDesktop", false);
        profile.put("screenWidth", metrics.widthPixels / metrics.density);
        profile.put("screenHeight", metrics.heightPixels / metrics.density);
        profile.put("pixelRatio", metrics.density);
        profile.put("safeAreaInsets", getSafeAreaInsets());
        
        return profile;
    }

    @PluginMethod
    public void getDeviceProfile(PluginCall call) {
        JSObject profile = buildDeviceProfile();
        call.resolve(profile);
    }

    @PluginMethod
    public void getControlHints(PluginCall call) {
        String inputMode = detectInputMode();
        JSObject hints = new JSObject();
        
        switch (inputMode) {
            case "touch":
                hints.put("movement", "Drag to move");
                hints.put("action", "Tap to interact");
                hints.put("camera", "Pinch to zoom");
                break;
            case "gamepad":
                hints.put("movement", "Left stick to move");
                hints.put("action", "A / X to interact");
                hints.put("camera", "Right stick to look");
                break;
            case "hybrid":
                hints.put("movement", "Touch or stick to move");
                hints.put("action", "Tap or A to interact");
                hints.put("camera", "Swipe or right stick");
                break;
            default:
                hints.put("movement", "Drag to move");
                hints.put("action", "Tap to interact");
                hints.put("camera", "Pinch to zoom");
                break;
        }
        
        call.resolve(hints);
    }

    @PluginMethod
    public void getInputSnapshot(PluginCall call) {
        JSObject snapshot = new JSObject();
        
        JSObject leftStick = new JSObject();
        leftStick.put("x", 0);
        leftStick.put("y", 0);
        
        JSObject rightStick = new JSObject();
        rightStick.put("x", 0);
        rightStick.put("y", 0);
        
        JSObject buttons = new JSObject();
        buttons.put("jump", false);
        buttons.put("action", false);
        buttons.put("cancel", false);
        
        JSObject triggers = new JSObject();
        triggers.put("left", 0);
        triggers.put("right", 0);

        int[] deviceIds = InputDevice.getDeviceIds();
        for (int deviceId : deviceIds) {
            InputDevice device = InputDevice.getDevice(deviceId);
            if (device != null) {
                int sources = device.getSources();
                if ((sources & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD ||
                    (sources & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK) {
                    
                    // Read gamepad state if available
                    float[] axes = gamepadAxes.get(deviceId);
                    Map<Integer, Boolean> buttonStates = gamepadButtons.get(deviceId);
                    
                    if (axes != null && axes.length >= 4) {
                        // Apply deadzone
                        float deadzone = 0.15f;
                        float lx = Math.abs(axes[0]) > deadzone ? axes[0] : 0;
                        float ly = Math.abs(axes[1]) > deadzone ? axes[1] : 0;
                        float rx = axes.length > 2 && Math.abs(axes[2]) > deadzone ? axes[2] : 0;
                        float ry = axes.length > 3 && Math.abs(axes[3]) > deadzone ? axes[3] : 0;
                        
                        leftStick.put("x", lx);
                        leftStick.put("y", ly);
                        rightStick.put("x", rx);
                        rightStick.put("y", ry);
                    }
                    
                    if (buttonStates != null) {
                        // Map common gamepad buttons (A=96, B=97, X=99 on Android)
                        buttons.put("jump", buttonStates.getOrDefault(96, false)); // A button
                        buttons.put("action", buttonStates.getOrDefault(97, false)); // B button
                        buttons.put("cancel", buttonStates.getOrDefault(99, false)); // X button
                        
                        // Triggers (L2=104, R2=105)
                        if (axes != null && axes.length > 5) {
                            triggers.put("left", axes[4]); // L2 trigger
                            triggers.put("right", axes[5]); // R2 trigger
                        }
                    }
                    break;
                }
            }
        }

        JSArray touchesArray = new JSArray();
        for (Map.Entry<Integer, JSObject> entry : activeTouches.entrySet()) {
            JSObject touchData = new JSObject();
            touchData.put("id", entry.getKey());
            try {
                touchData.put("position", entry.getValue().get("position"));
                touchData.put("phase", entry.getValue().getString("phase"));
            } catch (JSONException e) {
                Log.e("StrataPlugin", "Failed to serialize touch data", e);
            }
            touchesArray.put(touchData);
        }
        
        snapshot.put("timestamp", System.currentTimeMillis());
        snapshot.put("leftStick", leftStick);
        snapshot.put("rightStick", rightStick);
        snapshot.put("buttons", buttons);
        snapshot.put("triggers", triggers);
        snapshot.put("touches", touchesArray);
        
        call.resolve(snapshot);
    }

    @PluginMethod
    public void setInputMapping(PluginCall call) {
        String[] actionNames = {
            "moveForward", "moveBackward", "moveLeft", "moveRight",
            "jump", "action", "cancel"
        };
        
        try {
            for (String actionName : actionNames) {
                JSArray array = call.getArray(actionName);
                if (array != null) {
                    inputMapping.put(actionName, jsArrayToStringList(array));
                }
            }
        } catch (JSONException e) {
            Log.e("StrataPlugin", "Failed to parse input mapping", e);
        }
        
        call.resolve();
    }

    private List<String> jsArrayToStringList(JSArray array) throws JSONException {
        List<String> list = new ArrayList<>();
        for (int i = 0; i < array.length(); i++) {
            list.add(array.getString(i));
        }
        return list;
    }

    @PluginMethod
    public void triggerHaptics(PluginCall call) {
        String intensity = call.getString("intensity", "medium");
        Integer duration = call.getInt("duration");
        
        if (vibrator == null || !vibrator.hasVibrator()) {
            call.resolve();
            return;
        }

        long vibrationDuration;
        int amplitude;
        
        switch (intensity) {
            case "light":
                vibrationDuration = duration != null ? duration : 10;
                amplitude = 50;
                break;
            case "heavy":
                vibrationDuration = duration != null ? duration : 50;
                amplitude = 255;
                break;
            default:
                vibrationDuration = duration != null ? duration : 25;
                amplitude = 150;
                break;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(vibrationDuration, amplitude));
        } else {
            vibrator.vibrate(vibrationDuration);
        }
        
        call.resolve();
    }

    @PluginMethod
    public void triggerHaptic(PluginCall call) {
        JSObject pattern = call.getObject("pattern");
        
        if (vibrator == null || !vibrator.hasVibrator()) {
            call.resolve();
            return;
        }

        long duration = 50;
        int amplitude = 128;
        
        if (pattern != null) {
            duration = pattern.getInteger("duration", 50);
            double intensityValue = pattern.getDouble("intensity", 0.5);
            amplitude = (int) (intensityValue * 255);
            amplitude = Math.max(1, Math.min(255, amplitude));
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(duration, amplitude));
        } else {
            vibrator.vibrate(duration);
        }
        
        call.resolve();
    }

    @PluginMethod
    public void vibrate(PluginCall call) {
        Integer duration = call.getInt("duration", 200);
        
        if (vibrator == null || !vibrator.hasVibrator()) {
            call.resolve();
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE));
        } else {
            vibrator.vibrate(duration);
        }
        
        call.resolve();
    }

    public void handleTouchEvent(MotionEvent event) {
        int action = event.getActionMasked();
        int pointerIndex = event.getActionIndex();
        int pointerId = event.getPointerId(pointerIndex);
        
        switch (action) {
            case MotionEvent.ACTION_DOWN:
            case MotionEvent.ACTION_POINTER_DOWN:
                JSObject touchDown = new JSObject();
                JSObject positionDown = new JSObject();
                positionDown.put("x", event.getX(pointerIndex));
                positionDown.put("y", event.getY(pointerIndex));
                touchDown.put("position", positionDown);
                touchDown.put("phase", "began");
                activeTouches.put(pointerId, touchDown);
                break;
                
            case MotionEvent.ACTION_MOVE:
                for (int i = 0; i < event.getPointerCount(); i++) {
                    int id = event.getPointerId(i);
                    if (activeTouches.containsKey(id)) {
                        JSObject touchMove = new JSObject();
                        JSObject positionMove = new JSObject();
                        positionMove.put("x", event.getX(i));
                        positionMove.put("y", event.getY(i));
                        touchMove.put("position", positionMove);
                        touchMove.put("phase", "moved");
                        activeTouches.put(id, touchMove);
                    }
                }
                break;
                
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_POINTER_UP:
                activeTouches.remove(pointerId);
                break;
                
            case MotionEvent.ACTION_CANCEL:
                activeTouches.clear();
                break;
        }
    }

    public void notifyDeviceChange() {
        JSObject profile = buildDeviceProfile();
        notifyListeners("deviceChange", profile);
    }

    public void notifyGamepadConnected(int index, String id) {
        JSObject data = new JSObject();
        data.put("index", index);
        data.put("id", id);
        notifyListeners("gamepadConnected", data);
    }

    public void notifyGamepadDisconnected(int index) {
        JSObject data = new JSObject();
        data.put("index", index);
        notifyListeners("gamepadDisconnected", data);
    }
}
