package fr.wokgui.studiophotopicker;
import android.content.*;import android.database.*;import android.net.Uri;import android.os.ParcelFileDescriptor;import java.io.*;
public class PhotoProvider extends ContentProvider {
 public boolean onCreate(){return true;}
 private File file(Uri uri){String name=uri.getLastPathSegment();if(uri.getPathSegments().size()!=1||name==null||!name.matches("[a-zA-Z0-9_.-]+\\.(?i:png|jpg|jpeg|webp)"))throw new IllegalArgumentException("Photo invalide");return new File("/sdcard/Pictures/InterfaceStudio",name);}
 public String getType(Uri uri){String n=file(uri).getName().toLowerCase();return n.endsWith(".png")?"image/png":n.endsWith(".webp")?"image/webp":"image/jpeg";}
 public Cursor query(Uri uri,String[] projection,String selection,String[] args,String sort){File f=file(uri);String[] cols=projection==null?new String[]{"_display_name","_size"}:projection;MatrixCursor result=new MatrixCursor(cols);Object[] row=new Object[cols.length];for(int i=0;i<cols.length;i++)row[i]=cols[i].equals("_display_name")?f.getName():cols[i].equals("_size")?f.length():null;result.addRow(row);return result;}
 public ParcelFileDescriptor openFile(Uri uri,String mode)throws FileNotFoundException{if(!mode.equals("r"))throw new FileNotFoundException("Lecture seule");return ParcelFileDescriptor.open(file(uri),ParcelFileDescriptor.MODE_READ_ONLY);}
 public Uri insert(Uri u,ContentValues v){throw new UnsupportedOperationException();}public int update(Uri u,ContentValues v,String s,String[] a){throw new UnsupportedOperationException();}public int delete(Uri u,String s,String[] a){throw new UnsupportedOperationException();}
}
