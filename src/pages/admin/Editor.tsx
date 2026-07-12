import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';
import { db } from '../../lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Save, Send, Eye, ArrowLeft } from 'lucide-react';


const EditorStyles = React.memo(() => (
  <style>{`
    .tox-tinymce {
      border-top: none !important;
      border-left: none !important;
      border-right: none !important;
      border-bottom: none !important;
      border-radius: 0 !important;
    }
    .tox-tinymce-aux {
      z-index: 1300 !important;
    }
    /* Hide the branding link */
    .tox-statusbar__branding {
      display: none !important;
    }
  `}</style>
));

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [permalink, setPermalink] = useState('');
  const [isManualPermalink, setIsManualPermalink] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [publishDate, setPublishDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  
  const [savingAction, setSavingAction] = useState<'idle' | 'draft' | 'published'>('idle');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  
  const [postStatus, setPostStatus] = useState<'draft' | 'published'>('draft');
  const [initialData, setInitialData] = useState<any>(null);
  
  const initialContentRef = useRef<string>('');
  const editorRef = useRef<any>(null);
  const prevIsDarkMode = useRef(isDarkMode);

  if (prevIsDarkMode.current !== isDarkMode) {
    prevIsDarkMode.current = isDarkMode;
    initialContentRef.current = content;
  }

  // Check if dark mode is active by looking at HTML class
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    // Create an observer to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!id) {
      setTitle('');
      setContent('');
      setPermalink('');
      setIsManualPermalink(false);
      setInitialData(null);
      setPostStatus('draft');
      setIsLoading(false);
      initialContentRef.current = '';
      if (editorRef.current) {
        editorRef.current.setContent('');
      }
      return;
    }
    
    const docRef = doc(db, 'posts', id);
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setTitle(data.title || '');
        setPermalink(data.permalink || '');
        setIsManualPermalink(true);
        
        if (data.publishDate) {
          setPublishDate(data.publishDate);
        }
        if (data.content) {
          if (!initialContentRef.current) {
            initialContentRef.current = data.content;
          }
          setContent(data.content);
        }
        
        const loadedData = {
          title: data.title || '',
          content: data.content || '',
          permalink: data.permalink || '',
          publishDate: data.publishDate || '',
          status: data.status || 'draft'
        };
        setInitialData(loadedData);
        setPostStatus(loadedData.status);
        
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }).catch((error) => {
      console.error("Error fetching post:", error);
      setIsLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!isManualPermalink && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setPermalink(generated);
    }
  }, [title, isManualPermalink]);

  const handlePermalinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsManualPermalink(true);
    setPermalink(e.target.value);
  };

  const handleSave = async (status: 'draft' | 'published', isAutoSave = false) => {
    if (!title.trim()) {
      if (!isAutoSave) alert("Please enter a title before saving.");
      return;
    }
    
    if (!isAutoSave) setSavingAction(status);
    
    let currentContent = content;
    if (editorRef.current) {
      currentContent = editorRef.current.getContent();
      if (currentContent !== content) {
        setContent(currentContent);
        latestDataRef.current.content = currentContent;
      }
    }
    
    const plainText = new DOMParser().parseFromString(currentContent, 'text/html').body.textContent || '';
    const excerpt = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    
    const postData: any = {
      title,
      content: currentContent,
      excerpt,
      status,
      publishDate,
      permalink,
      updatedAt: serverTimestamp()
    };

    try {

      if (id) {
        // Fire and forget for instant UI response
        updateDoc(doc(db, 'posts', id), postData).catch(error => {
          console.error("Error saving post:", error);
        });
        
        setInitialData({
          title,
          content,
          permalink,
          publishDate,
          status
        });
        setPostStatus(status);
        if (!isAutoSave) setTimeout(() => alert(`Post ${status === 'draft' ? 'saved as draft' : 'published'}!`), 50);
      } else {
        // Generate ID instantly for new post
        const newDocRef = doc(collection(db, 'posts'));
        latestDataRef.current.id = newDocRef.id;
        
        setDoc(newDocRef, {
          ...postData,
          createdAt: serverTimestamp()
        }).catch(error => {
          console.error("Error creating post:", error);
        });
        
        setInitialData({
          title,
          content,
          permalink,
          publishDate,
          status
        });
        setPostStatus(status);
        navigate(`/admin/editor/${newDocRef.id}`, { replace: true });
        if (!isAutoSave) setTimeout(() => alert(`New post ${status === 'draft' ? 'saved as draft' : 'published'}!`), 50);
      }
    } catch (error) {
      console.error("Error in save logic:", error);
      if (!isAutoSave) alert("Failed to save post");
    } finally {
      if (!isAutoSave) setSavingAction('idle');
    }
  };

  const editorInit = useMemo(() => ({
    height: '100%',
    menubar: true,
    licenseKey: 'gpl',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks fontfamily fontsize | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent blockquote | ' +
      'removeformat | fullscreen | help',
    font_family_formats: 'Playfair Display=Playfair Display, serif; Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats',
    content_style: `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
      body { 
        font-family: 'Helvetica', 'Arial', sans-serif; 
        font-size: 16px;
        line-height: 1.6;
        color: ${isDarkMode ? '#e5e7eb' : '#374151'};
        background-color: ${isDarkMode ? '#111827' : '#ffffff'};
        margin: 20px;
      }
      p { margin: 0; padding: 0; }
      h1, h2, h3, h4, h5, h6 { 
        font-family: 'Playfair Display', serif; 
        font-weight: 700; 
        color: ${isDarkMode ? '#f9fafb' : '#111827'};
        margin-bottom: 0.5em;
      }
    `,
    skin: isDarkMode ? 'oxide-dark' : 'oxide',
    content_css: isDarkMode ? 'dark' : 'default',
  }), [isDarkMode]);

  const isDirty = !id || !initialData || (
    title !== initialData.title ||
    content !== initialData.content ||
    permalink !== initialData.permalink ||
    publishDate !== initialData.publishDate
  );

  // Debounced Auto-Save
  useEffect(() => {
    if (!isDirty || !title.trim()) return;
    const timeout = setTimeout(() => {
      handleSave(postStatus, true);
    }, 2000); // 2 seconds of inactivity
    return () => clearTimeout(timeout);
  }, [title, content, permalink, publishDate, isDirty, postStatus]);

  // Auto-save on unmount
  const latestDataRef = useRef({ title, content, permalink, publishDate, postStatus, isDirty, id });
  useEffect(() => {
    latestDataRef.current = { title, content, permalink, publishDate, postStatus, isDirty, id };
  }, [title, content, permalink, publishDate, postStatus, isDirty, id]);

  useEffect(() => {
    return () => {
      const current = latestDataRef.current;
      if (current.isDirty && current.title.trim()) {
        const plainText = new DOMParser().parseFromString(current.content, 'text/html').body.textContent || '';
        const excerpt = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
        const postData = {
          title: current.title,
          content: current.content,
          excerpt,
          status: current.postStatus,
          publishDate: current.publishDate,
          permalink: current.permalink,
          updatedAt: serverTimestamp()
        };
        if (current.id) {
          updateDoc(doc(db, 'posts', current.id), postData).catch(console.error);
        } else {
          setDoc(doc(collection(db, 'posts')), { ...postData, createdAt: serverTimestamp() }).catch(console.error);
        }
      }
    };
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/posts')} 
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Back to posts"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            {id ? 'Edit Post' : 'New Post'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Eye size={16} />
            Preview
          </button>
          <button 
            onClick={() => handleSave('draft')}
            disabled={savingAction !== 'idle' || (!isDirty && postStatus === 'draft')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {savingAction === 'draft' ? 'Saving...' : (!isDirty ? 'Saved' : (id ? 'Save' : 'Save Draft'))}
          </button>
          <button 
            onClick={() => handleSave('published')}
            disabled={savingAction !== 'idle' || (!isDirty && postStatus === 'published')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            {savingAction === 'published' ? 'Publishing...' : (!isDirty && postStatus === 'published' ? 'Published' : 'Publish')}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Editor Area */}
        <div className="flex-1 h-full overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 border-none focus:outline-none focus:ring-0 p-8 shrink-0 bg-transparent font-playfair"
            style={{ fontFamily: "'Playfair Display', serif" }}
          />
          <div className="flex-1 w-full h-full p-0 m-0 relative">
            <EditorStyles />
            
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : (
              <TinyMCEEditor
                key={isDarkMode ? 'dark' : 'light'}
                tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
                onInit={(_evt, editor) => (editorRef.current = editor)}
                initialValue={initialContentRef.current}
                onEditorChange={(newContent) => setContent(newContent)}
                init={editorInit}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar - Scrollable */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 p-6 overflow-y-auto bg-gray-50 dark:bg-[#0a0608]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">
              Post Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publish Date
                </label>
                <input
                  type={publishDate.slice(0, 10) < new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10) ? "date" : "datetime-local"}
                  value={publishDate.slice(0, 10) < new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10) ? publishDate.slice(0, 10) : publishDate}
                  onChange={(e) => {
                    if (e.target.value.length === 10) {
                      setPublishDate(e.target.value + "T00:00");
                    } else {
                      setPublishDate(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 dark:bg-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800 transition-colors"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Permalink
                  </label>
                  {!isManualPermalink && title && (
                    <span className="text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Auto</span>
                  )}
                </div>
                <div className="flex items-center shadow-sm rounded-md w-full">
                  <span 
                    className="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-700 px-3 py-2 rounded-l-md text-sm whitespace-nowrap shrink-0"
                    title={`${window.location.origin}/blog/`}
                  >
                    /blog/
                  </span>
                  <input
                    type="text"
                    value={permalink}
                    onChange={handlePermalinkChange}
                    placeholder="post-slug"
                    className="flex-1 w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm hover:border-gray-400 transition-colors"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Used for the post URL. Spaces will be automatically converted to hyphens.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Post Info</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Word count</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {content.replace(/<[^>]+>/g, '').split(/\s+/).filter(word => word.length > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {id ? 'Editing existing' : 'Drafting new'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-12 pb-4 border-b dark:border-gray-800">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                {title || 'Untitled Post'}
              </h2>
              <button 
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md font-medium transition-colors"
              >
                Close Preview
              </button>
            </div>
            <div 
              className="prose dark:prose-invert max-w-none"
              style={{ fontFamily: "'Playfair Display', serif" }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
