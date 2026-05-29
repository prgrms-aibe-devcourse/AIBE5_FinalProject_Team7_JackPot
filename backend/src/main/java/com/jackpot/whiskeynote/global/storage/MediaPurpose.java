package com.jackpot.whiskeynote.global.storage;

public enum MediaPurpose {
    WHISKEY("whiskeys"),
    POST("posts"),
    PROFILE("profiles");

    private final String prefix;

    MediaPurpose(String prefix) {
        this.prefix = prefix;
    }

    public String prefix() {
        return prefix;
    }
}
